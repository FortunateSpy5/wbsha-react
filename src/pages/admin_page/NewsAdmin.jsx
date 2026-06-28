import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../../styles/admin/news-admin.scss";

export const NewsAdmin = () => {
	const [imageUpload, setImageUpload] = useState(null);
	const [imageUploadError, setImageUploadError] = useState(null);
	const [newsData, setNewsData] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const newsRef = collection(db, "news");

	const fetchNews = async () => {
		try {
			const data = await getDocs(newsRef);
			const mappedData = data.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
				date: doc.data().date?.toDate() || new Date(doc.data().date)
			}));
			const sortedData = mappedData.sort((a, b) => b.date - a.date);
			setNewsData(sortedData);
		} catch (error) {
			console.error("Error fetching news:", error);
		}
	};

	useEffect(() => {
		fetchNews();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const schema = yup.object().shape({
		title: yup.string().required("Title is required"),
		content: yup.string().required("Content is required"),
		date: yup.date().required("Date is required"),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: yupResolver(schema),
	});

	const onAddNews = async (data) => {
		if (!imageUpload) {
			setImageUploadError("Image is required");
			return;
		}
		setImageUploadError(null);
		setIsSubmitting(true);

		try {
			const imageName = `${Date.now()}_${imageUpload.name}`;
			const storageRef = ref(storage, `news/${imageName}`);
			const snapshot = await uploadBytes(storageRef, imageUpload);
			const url = await getDownloadURL(snapshot.ref);

			const newDoc = {
				title: data.title,
				content: data.content,
				date: new Date(data.date),
				imageUrl: url,
				createdAt: new Date()
			};

			await addDoc(newsRef, newDoc);
			reset();
			setImageUpload(null);
			// Reset the file input visually
			const fileInput = document.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = "";
			
			// Clear sessionStorage cache so the public page refreshes
			sessionStorage.removeItem("news_data");
			sessionStorage.removeItem("home_news");

			fetchNews();
		} catch (error) {
			console.error("Error adding news:", error);
		}
		setIsSubmitting(false);
	};

	const onDeleteNews = async (id, imageUrl) => {
		if (!window.confirm("Are you sure you want to delete this news article?")) return;

		try {
			// Extract image path from Firebase Storage URL
			// Example URL: https://firebasestorage.googleapis.com/v0/b/wbsha-f8e09.appspot.com/o/news%2F1719600000_img.jpg?alt=media
			const decodedUrl = decodeURIComponent(imageUrl);
			const parts = decodedUrl.split("/o/");
			if (parts.length > 1) {
				const filePath = parts[1].split("?")[0];
				const storageRef = ref(storage, filePath);
				await deleteObject(storageRef).catch(err => console.warn("Image file not found in storage, proceeding to delete doc", err));
			}

			await deleteDoc(doc(db, "news", id));
			
			sessionStorage.removeItem("news_data");
			sessionStorage.removeItem("home_news");
			
			fetchNews();
		} catch (error) {
			console.error("Error deleting news:", error);
		}
	};

	return (
		<div className="news-admin">
			<h2 className="news-admin-title page-heading">Add News Article</h2>
			<form className="news-admin-form" onSubmit={handleSubmit(onAddNews)}>
				<input
					className="news-admin-input"
					placeholder="Title..."
					{...register("title")}
				/>
				<p className="news-admin-error">{errors.title?.message}</p>

				<textarea
					className="news-admin-input news-admin-textarea"
					placeholder="Content..."
					rows="6"
					{...register("content")}
				/>
				<p className="news-admin-error">{errors.content?.message}</p>

				<input
					className="news-admin-input"
					type="date"
					{...register("date")}
				/>
				<p className="news-admin-error">{errors.date?.message}</p>

				<input
					className="news-admin-file"
					type="file"
					accept="image/*"
					onChange={(event) => setImageUpload(event.target.files[0])}
				/>
				{imageUploadError && (
					<p className="news-admin-error">{imageUploadError}</p>
				)}

				<input 
					className="news-admin-submit button" 
					type="submit" 
					value={isSubmitting ? "Uploading..." : "Add News"} 
					disabled={isSubmitting}
				/>
			</form>

			<h2 className="news-admin-title page-heading">Current News Articles</h2>
			<div className="news-list">
				{newsData.length === 0 ? (
					<p>No news articles found.</p>
				) : (
					newsData.map((item) => (
						<div key={item.id} className="news-item">
							<img className="news-img" src={item.imageUrl} alt={item.title} />
							<div className="news-info">
								<h3 className="news-title">{item.title}</h3>
								<p className="news-date">Date: {item.date?.toLocaleDateString()}</p>
								<button
									className="news-delete-btn"
									onClick={() => onDeleteNews(item.id, item.imageUrl)}
								>
									Delete
								</button>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
