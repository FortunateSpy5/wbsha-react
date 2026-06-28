import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../../styles/admin/media-admin.scss";

export const MediaAdmin = () => {
	const [imageUpload, setImageUpload] = useState(null);
	const [imageUploadError, setImageUploadError] = useState(null);
	const [mediaData, setMediaData] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const mediaRef = collection(db, "media");

	const fetchMedia = async () => {
		try {
			const data = await getDocs(mediaRef);
			const mappedData = data.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}));
			// Group by album name
			setMediaData(mappedData);
		} catch (error) {
			console.error("Error fetching media:", error);
		}
	};

	useEffect(() => {
		fetchMedia();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const schema = yup.object().shape({
		title: yup.string().required("Title is required"),
		album: yup.string().required("Album name is required"),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: yupResolver(schema),
	});

	const onAddMedia = async (data) => {
		if (!imageUpload) {
			setImageUploadError("Image is required");
			return;
		}
		setImageUploadError(null);
		setIsSubmitting(true);

		try {
			const imageName = `${Date.now()}_${imageUpload.name}`;
			const storageRef = ref(storage, `media/${imageName}`);
			const snapshot = await uploadBytes(storageRef, imageUpload);
			const url = await getDownloadURL(snapshot.ref);

			const newDoc = {
				title: data.title,
				album: data.album,
				imageUrl: url,
				createdAt: new Date()
			};

			await addDoc(mediaRef, newDoc);
			reset();
			setImageUpload(null);
			const fileInput = document.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = "";

			sessionStorage.removeItem("media_data");
			sessionStorage.removeItem("home_media");

			fetchMedia();
		} catch (error) {
			console.error("Error adding media:", error);
		}
		setIsSubmitting(false);
	};

	const onDeleteMedia = async (id, imageUrl) => {
		if (!window.confirm("Are you sure you want to delete this media image?")) return;

		try {
			const decodedUrl = decodeURIComponent(imageUrl);
			const parts = decodedUrl.split("/o/");
			if (parts.length > 1) {
				const filePath = parts[1].split("?")[0];
				const storageRef = ref(storage, filePath);
				await deleteObject(storageRef).catch(err => console.warn("Image file not found in storage, proceeding to delete doc", err));
			}

			await deleteDoc(doc(db, "media", id));
			
			sessionStorage.removeItem("media_data");
			sessionStorage.removeItem("home_media");

			fetchMedia();
		} catch (error) {
			console.error("Error deleting media:", error);
		}
	};

	// Grouping media by album
	const albumsMap = mediaData.reduce((acc, item) => {
		if (!acc[item.album]) {
			acc[item.album] = [];
		}
		acc[item.album].push(item);
		return acc;
	}, {});

	return (
		<div className="media-admin">
			<h2 className="media-admin-title page-heading">Add Gallery Image</h2>
			<form className="media-admin-form" onSubmit={handleSubmit(onAddMedia)}>
				<input
					className="media-admin-input"
					placeholder="Image Title..."
					{...register("title")}
				/>
				<p className="media-admin-error">{errors.title?.message}</p>

				<input
					className="media-admin-input"
					placeholder="Album / Category Name..."
					{...register("album")}
				/>
				<p className="media-admin-error">{errors.album?.message}</p>

				<input
					className="media-admin-file"
					type="file"
					accept="image/*"
					onChange={(event) => setImageUpload(event.target.files[0])}
				/>
				{imageUploadError && (
					<p className="media-admin-error">{imageUploadError}</p>
				)}

				<input 
					className="media-admin-submit button" 
					type="submit" 
					value={isSubmitting ? "Uploading..." : "Add Image"} 
					disabled={isSubmitting}
				/>
			</form>

			<h2 className="media-admin-title page-heading">Current Albums & Images</h2>
			{Object.keys(albumsMap).length === 0 ? (
				<p>No gallery images found.</p>
			) : (
				Object.keys(albumsMap).map((albumName) => (
					<div key={albumName} className="admin-album-section">
						<h3 className="admin-album-title">{albumName}</h3>
						<div className="media-list">
							{albumsMap[albumName].map((item) => (
								<div key={item.id} className="media-item">
									<img className="media-img" src={item.imageUrl} alt={item.title} />
									<div className="media-info">
										<p className="media-title">{item.title}</p>
										<button
											className="media-delete-btn"
											onClick={() => onDeleteMedia(item.id, item.imageUrl)}
										>
											Delete
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				))
			)}
		</div>
	);
};
