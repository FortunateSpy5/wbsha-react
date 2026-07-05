import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, getDocs, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../../styles/admin/news-admin.scss";

export const NewsAdmin = () => {
	const [imageUpload, setImageUpload] = useState(null);
	const [imageUploadError, setImageUploadError] = useState(null);
	const [newsData, setNewsData] = useState([]);
	const [editingNews, setEditingNews] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState(null);

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
		category: yup.string().required("Category is required"),
		isFeatured: yup.boolean().default(false),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			category: "general",
			isFeatured: false
		}
	});

	useEffect(() => {
		if (editingNews) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			reset({
				title: editingNews.title || "",
				content: editingNews.content || "",
				date: editingNews.date ? editingNews.date.toISOString().split("T")[0] : "",
				category: editingNews.category || "general",
				isFeatured: editingNews.isFeatured || false,
			});
		} else {
			reset({
				title: "",
				content: "",
				date: "",
				category: "general",
				isFeatured: false,
			});
		}
	}, [editingNews, reset]);

	const onAddOrUpdateNews = async (data) => {
		if (!imageUpload && !editingNews) {
			setImageUploadError("Image is required");
			return;
		}
		setImageUploadError(null);
		setIsSubmitting(true);
		setSuccessMessage(null);

		try {
			let imageUrl = editingNews?.imageUrl || null;

			if (imageUpload) {
				const imageName = `${Date.now()}_${imageUpload.name}`;
				const storageRef = ref(storage, `news/${imageName}`);
				const snapshot = await uploadBytes(storageRef, imageUpload);
				imageUrl = await getDownloadURL(snapshot.ref);

				// Delete old image if editing
				if (editingNews?.imageUrl) {
					const oldUrl = editingNews.imageUrl;
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

			// If setting this post as featured, reset any other featured posts in firestore
			if (data.isFeatured === true) {
				try {
					const featuredQuery = query(newsRef, where("isFeatured", "==", true));
					const snap = await getDocs(featuredQuery);
					const batchUpdates = snap.docs.map((item) => {
						if (editingNews && item.id === editingNews.id) return Promise.resolve();
						return updateDoc(doc(db, "news", item.id), { isFeatured: false });
					});
					await Promise.all(batchUpdates);
				} catch (err) {
					console.warn("Error resetting featured news items:", err);
				}
			}

			const preparedData = {
				title: data.title,
				content: data.content,
				date: new Date(data.date),
				category: data.category,
				isFeatured: data.isFeatured || false,
				imageUrl,
				updatedAt: new Date()
			};

			if (editingNews) {
				await updateDoc(doc(db, "news", editingNews.id), preparedData);
				setSuccessMessage(`News article "${data.title}" updated successfully!`);
				setEditingNews(null);
			} else {
				preparedData.createdAt = new Date();
				await addDoc(newsRef, preparedData);
				setSuccessMessage(`News article "${data.title}" created successfully!`);
			}

			reset();
			setImageUpload(null);
			const fileInput = document.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = "";
			
			sessionStorage.removeItem("news_data");
			sessionStorage.removeItem("home_news");

			fetchNews();

			setTimeout(() => {
				setSuccessMessage(null);
			}, 4000);
		} catch (error) {
			console.error("Error saving news:", error);
			alert("Failed to save news article.");
		}
		setIsSubmitting(false);
	};

	const onDeleteNews = async (id, imageUrl) => {
		if (!window.confirm("Are you sure you want to delete this news article?")) return;

		try {
			if (imageUrl && imageUrl.includes("firebasestorage.googleapis.com")) {
				const decodedUrl = decodeURIComponent(imageUrl);
				const parts = decodedUrl.split("/o/");
				if (parts.length > 1) {
					const filePath = parts[1].split("?")[0];
					await deleteObject(ref(storage, filePath)).catch(err => console.warn("Image file not found in storage, proceeding to delete doc", err));
				}
			}

			await deleteDoc(doc(db, "news", id));
			sessionStorage.removeItem("news_data");
			sessionStorage.removeItem("home_news");
			fetchNews();
			setSuccessMessage("News article deleted successfully.");
			setTimeout(() => setSuccessMessage(null), 4000);
		} catch (error) {
			console.error("Error deleting news:", error);
		}
	};

	return (
		<div className="news-admin">
			<h2 className="news-admin-title page-heading">
				{editingNews ? "Edit News Article" : "Add News Article"}
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

			<form className="news-admin-form" onSubmit={handleSubmit(onAddOrUpdateNews)}>
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

				<div className="news-admin-form-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "0.5rem" }}>
					<label style={{ fontWeight: "600", fontSize: "0.9rem" }}>Article Category:</label>
					<select className="news-admin-input" {...register("category")} style={{ padding: "0.75rem", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
						<option value="general">General News</option>
						<option value="tournaments">Tournaments & Updates</option>
						<option value="announcements">Association Announcements</option>
						<option value="selections">Player Selections</option>
						<option value="achievements">Achievements & Awards</option>
					</select>
				</div>
				<p className="news-admin-error">{errors.category?.message}</p>

				<label className="checkbox-label" style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: "0.75rem 0 1rem 0", fontWeight: "600", fontSize: "0.9rem", cursor: "pointer", color: "#1e293b" }}>
					<input type="checkbox" {...register("isFeatured")} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
					Spotlight this article as Featured / Pinned News
				</label>

				<div className="file-upload-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
					<label style={{ fontWeight: "600", fontSize: "0.9rem" }}>
						Cover Image {editingNews && "(Optional if keeping current)"}:
					</label>
					<input
						className="news-admin-file"
						type="file"
						accept="image/*"
						onChange={(event) => setImageUpload(event.target.files[0])}
					/>
				</div>
				{imageUploadError && (
					<p className="news-admin-error">{imageUploadError}</p>
				)}

				{editingNews?.imageUrl && (
					<div className="current-img-preview" style={{ marginTop: "0.5rem" }}>
						<img src={editingNews.imageUrl} alt="Current" style={{ width: "120px", height: "70px", objectFit: "cover", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
						<p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.25rem 0 0 0" }}>Current Article Cover</p>
					</div>
				)}

				<div className="form-actions" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
					{editingNews && (
						<button
							type="button"
							className="button button-secondary"
							onClick={() => setEditingNews(null)}
							disabled={isSubmitting}
							style={{ padding: "0.75rem 1.5rem" }}
						>
							Cancel Edit
						</button>
					)}
					<input 
						className="news-admin-submit button" 
						type="submit" 
						value={isSubmitting ? "Saving..." : (editingNews ? "Save Changes" : "Add News")} 
						disabled={isSubmitting}
						style={{ flexGrow: 1 }}
					/>
				</div>
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
								<h3 className="news-title" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", margin: 0 }}>
									{item.title}
									{item.isFeatured && <span style={{ background: "#fef3c7", color: "#d97706", fontSize: "0.7rem", fontWeight: "700", padding: "0.1rem 0.5rem", borderRadius: "9999px", border: "1px solid #fcd34d" }}>⭐ Featured</span>}
									<span style={{ background: "#e2e8f0", color: "#475569", fontSize: "0.7rem", fontWeight: "600", padding: "0.1rem 0.5rem", borderRadius: "9999px", textTransform: "capitalize" }}>{item.category || "general"}</span>
								</h3>
								<p className="news-date">Date: {item.date?.toLocaleDateString()}</p>
								<div className="item-actions" style={{ display: "flex", gap: "0.5rem", marginTop: "auto", width: "100%" }}>
									<button
										className="news-edit-btn"
										onClick={() => setEditingNews(item)}
									>
										Edit
									</button>
									<button
										className="news-delete-btn"
										onClick={() => onDeleteNews(item.id, item.imageUrl)}
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};
