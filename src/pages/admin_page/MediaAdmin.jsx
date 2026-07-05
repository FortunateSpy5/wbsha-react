import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../../styles/admin/media-admin.scss";

export const MediaAdmin = () => {
	const [imageUpload, setImageUpload] = useState(null);
	const [imageUploadError, setImageUploadError] = useState(null);
	const [mediaData, setMediaData] = useState([]);
	const [editingMedia, setEditingMedia] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState(null);

	const mediaRef = collection(db, "media");

	const fetchMedia = async () => {
		try {
			const data = await getDocs(mediaRef);
			const mappedData = data.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}));
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

	useEffect(() => {
		if (editingMedia) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			reset({
				title: editingMedia.title || "",
				album: editingMedia.album || "",
			});
		} else {
			reset({
				title: "",
				album: "",
			});
		}
	}, [editingMedia, reset]);

	const onAddOrUpdateMedia = async (data) => {
		if (!imageUpload && !editingMedia) {
			setImageUploadError("Image is required");
			return;
		}
		setImageUploadError(null);
		setIsSubmitting(true);
		setSuccessMessage(null);

		try {
			let imageUrl = editingMedia?.imageUrl || null;

			if (imageUpload) {
				const imageName = `${Date.now()}_${imageUpload.name}`;
				const storageRef = ref(storage, `media/${imageName}`);
				const snapshot = await uploadBytes(storageRef, imageUpload);
				imageUrl = await getDownloadURL(snapshot.ref);

				// Delete old image if editing
				if (editingMedia?.imageUrl) {
					const oldUrl = editingMedia.imageUrl;
					if (oldUrl.includes("firebasestorage.googleapis.com")) {
						const decodedUrl = decodeURIComponent(oldUrl);
						const parts = decodedUrl.split("/o/");
						if (parts.length > 1) {
							const filePath = parts[1].split("?")[0];
							await deleteObject(ref(storage, filePath)).catch(err => console.warn(err));
						}
					}
				}
			}

			const preparedData = {
				title: data.title,
				album: data.album,
				imageUrl,
				updatedAt: new Date()
			};

			if (editingMedia) {
				await updateDoc(doc(db, "media", editingMedia.id), preparedData);
				setSuccessMessage(`Gallery image "${data.title}" updated successfully!`);
				setEditingMedia(null);
			} else {
				preparedData.createdAt = new Date();
				await addDoc(mediaRef, preparedData);
				setSuccessMessage(`Gallery image "${data.title}" created successfully!`);
			}

			reset();
			setImageUpload(null);
			const fileInput = document.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = "";

			sessionStorage.removeItem("media_data");
			sessionStorage.removeItem("home_media");

			fetchMedia();

			setTimeout(() => {
				setSuccessMessage(null);
			}, 4000);
		} catch (error) {
			console.error("Error saving media:", error);
			alert("Failed to save gallery image.");
		}
		setIsSubmitting(false);
	};

	const onDeleteMedia = async (id, imageUrl) => {
		if (!window.confirm("Are you sure you want to delete this media image?")) return;

		try {
			if (imageUrl && imageUrl.includes("firebasestorage.googleapis.com")) {
				const decodedUrl = decodeURIComponent(imageUrl);
				const parts = decodedUrl.split("/o/");
				if (parts.length > 1) {
					const filePath = parts[1].split("?")[0];
					const storageRef = ref(storage, filePath);
					await deleteObject(storageRef).catch(err => console.warn("Image file not found in storage, proceeding to delete doc", err));
				}
			}

			await deleteDoc(doc(db, "media", id));
			sessionStorage.removeItem("media_data");
			sessionStorage.removeItem("home_media");
			fetchMedia();
			setSuccessMessage("Gallery image deleted successfully.");
			setTimeout(() => setSuccessMessage(null), 4000);
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
			<h2 className="media-admin-title page-heading">
				{editingMedia ? "Edit Gallery Image" : "Add Gallery Image"}
			</h2>

			{successMessage && (
				<div className="admin-success-banner" style={{
					background: "#d1fae5",
					color: "#065f46",
					padding: "1rem",
					borderRadius: "4px",
					marginBottom: "1.5rem",
					fontWeight: "600",
					border: "1px solid #a7f3d0"
				}}>
					✅ {successMessage}
				</div>
			)}

			<form className="media-admin-form" onSubmit={handleSubmit(onAddOrUpdateMedia)}>
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

				<div className="file-upload-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
					<label style={{ fontWeight: "600", fontSize: "0.9rem" }}>
						Select Image File {editingMedia && "(Optional if keeping current)"}:
					</label>
					<input
						className="media-admin-file"
						type="file"
						accept="image/*"
						onChange={(event) => setImageUpload(event.target.files[0])}
					/>
				</div>
				{imageUploadError && (
					<p className="media-admin-error">{imageUploadError}</p>
				)}

				{editingMedia?.imageUrl && (
					<div className="current-img-preview" style={{ marginTop: "0.5rem" }}>
						<img src={editingMedia.imageUrl} alt="Current" style={{ width: "120px", height: "70px", objectFit: "cover", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
						<p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.25rem 0 0 0" }}>Current Gallery Image</p>
					</div>
				)}

				<div className="form-actions" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
					{editingMedia && (
						<button
							type="button"
							className="button button-secondary"
							onClick={() => setEditingMedia(null)}
							disabled={isSubmitting}
							style={{ padding: "0.75rem 1.5rem" }}
						>
							Cancel Edit
						</button>
					)}
					<input 
						className="media-admin-submit button" 
						type="submit" 
						value={isSubmitting ? "Saving..." : (editingMedia ? "Save Changes" : "Add Image")} 
						disabled={isSubmitting}
						style={{ flexGrow: 1 }}
					/>
				</div>
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
										<div className="item-actions" style={{ display: "flex", gap: "0.5rem", marginTop: "auto", width: "100%" }}>
											<button
												className="media-edit-btn"
												onClick={() => setEditingMedia(item)}
											>
												Edit
											</button>
											<button
												className="media-delete-btn"
												onClick={() => onDeleteMedia(item.id, item.imageUrl)}
											>
												Delete
											</button>
										</div>
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
