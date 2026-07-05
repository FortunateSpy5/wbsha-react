import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
	addDoc,
	collection,
	getDocs,
	updateDoc,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import {
	ref,
	uploadBytes,
	getDownloadURL,
	deleteObject,
} from "firebase/storage";
import "../../styles/admin/hero-admin.scss";

export const HeroAdmin = () => {
	const [imageUpload, setImageUpload] = useState(null);
	const [imageUploadError, setImageUploadError] = useState(null);
	const [heroData, setHeroData] = useState([]);
	const [editingHero, setEditingHero] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState(null);

	const heroRef = collection(db, "heroes");

	const fetchHeroes = async () => {
		try {
			const data = await getDocs(heroRef);
			const mappedData = data.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}));
			const sortedData = mappedData.sort((a, b) => a.order - b.order);
			setHeroData(sortedData);
		} catch (error) {
			console.error("Error fetching heroes:", error);
		}
	};

	useEffect(() => {
		fetchHeroes();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const schema = yup.object().shape({
		title: yup.string().required("Title is required"),
		description: yup.string().required("Description is required"),
		order: yup
			.number()
			.integer("Order must be a whole number")
			.required("Order is required"),
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
		if (editingHero) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			reset({
				title: editingHero.title || "",
				description: editingHero.description || "",
				order: editingHero.order || 0,
			});
		} else {
			reset({
				title: "",
				description: "",
				order: 0,
			});
		}
	}, [editingHero, reset]);

	const onAddOrUpdateHero = async (data) => {
		if (!imageUpload && !editingHero) {
			setImageUploadError("Image is required");
			return;
		}
		setImageUploadError(null);
		setIsSubmitting(true);
		setSuccessMessage(null);

		try {
			let url = editingHero?.url || null;

			if (imageUpload) {
				// Upload new image
				const imageName = `${Date.now()}_${imageUpload.name}`;
				const storageRef = ref(storage, `heroes/${imageName}`);
				const snapshot = await uploadBytes(storageRef, imageUpload);
				url = await getDownloadURL(snapshot.ref);

				// Delete old image if editing
				if (editingHero?.url) {
					const oldUrl = editingHero.url;
					if (oldUrl.includes("firebasestorage.googleapis.com")) {
						const decodedUrl = decodeURIComponent(oldUrl);
						const parts = decodedUrl.split("/o/");
						if (parts.length > 1) {
							const filePath = parts[1].split("?")[0];
							await deleteObject(ref(storage, filePath)).catch((err) =>
								console.warn("Could not delete old image:", err)
							);
						}
					}
				}
			}

			const preparedData = {
				title: data.title,
				description: data.description,
				order: Number(data.order),
				url,
				updatedAt: new Date(),
			};

			if (editingHero) {
				await updateDoc(doc(db, "heroes", editingHero.id), preparedData);
				setSuccessMessage(`Hero slide "${data.title}" updated successfully!`);
				setEditingHero(null);
			} else {
				preparedData.createdAt = new Date();
				await addDoc(heroRef, preparedData);
				setSuccessMessage(`Hero slide "${data.title}" created successfully!`);
			}

			reset();
			setImageUpload(null);
			const fileInput = document.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = "";

			sessionStorage.removeItem("home_heroes");
			fetchHeroes();

			setTimeout(() => {
				setSuccessMessage(null);
			}, 4000);
		} catch (error) {
			console.error("Error saving hero:", error);
			alert("Failed to save hero slide.");
		}
		setIsSubmitting(false);
	};

	const onDeleteHero = async (id, url) => {
		if (!window.confirm("Are you sure you want to delete this hero slide?")) return;

		try {
			if (url && url.includes("firebasestorage.googleapis.com")) {
				const decodedUrl = decodeURIComponent(url);
				const parts = decodedUrl.split("/o/");
				if (parts.length > 1) {
					const filePath = parts[1].split("?")[0];
					await deleteObject(ref(storage, filePath)).catch((err) =>
						console.warn("Image file not found in storage, proceeding to delete doc", err)
					);
				}
			}

			await deleteDoc(doc(db, "heroes", id));
			sessionStorage.removeItem("home_heroes");
			fetchHeroes();
			setSuccessMessage("Hero slide deleted successfully.");
			setTimeout(() => setSuccessMessage(null), 4000);
		} catch (error) {
			console.error("Error removing document: ", error);
		}
	};

	return (
		<div className="hero-admin">
			<h2 className="hero-admin-title page-heading">
				{editingHero ? "Edit Hero Slide" : "Add Hero Slide"}
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

			<form className="hero-admin-form" onSubmit={handleSubmit(onAddOrUpdateHero)}>
				<input
					className="hero-admin-input"
					placeholder="Title..."
					{...register("title")}
				/>
				<p className="hero-admin-error">{errors.title?.message}</p>
				<input
					className="hero-admin-input"
					placeholder="Description..."
					{...register("description")}
				/>
				<p className="hero-admin-error">{errors.description?.message}</p>
				<input
					className="hero-admin-input"
					placeholder="Order..."
					{...register("order")}
				/>
				<p className="hero-admin-error">{errors.order?.message}</p>
				
				<div className="file-upload-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
					<label style={{ fontWeight: "600", fontSize: "0.9rem" }}>
						Slide Background Image {editingHero && "(Optional if keeping current)"}:
					</label>
					<input
						className="hero-admin-file"
						type="file"
						onChange={(event) => setImageUpload(event.target.files[0])}
					/>
					<p style={{ fontSize: "0.8rem", color: "#64748b", margin: "-0.25rem 0 0.25rem 0", lineHeight: "1.4" }}>
						💡 Recommended resolution: <strong>1920x800</strong> or larger (16:9 aspect ratio, at least 1500px wide) to prevent stretch-pixelation on widescreen monitors.
					</p>
				</div>
				{imageUploadError && (
					<p className="hero-admin-error">{imageUploadError}</p>
				)}

				{editingHero?.url && (
					<div className="current-img-preview" style={{ marginTop: "0.5rem" }}>
						<img src={editingHero.url} alt="Current" style={{ width: "120px", height: "70px", objectFit: "cover", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
						<p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.25rem 0 0 0" }}>Current Slide Image</p>
					</div>
				)}

				<div className="form-actions" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
					{editingHero && (
						<button
							type="button"
							className="button button-secondary"
							onClick={() => setEditingHero(null)}
							disabled={isSubmitting}
							style={{ padding: "0.75rem 1.5rem" }}
						>
							Cancel Edit
						</button>
					)}
					<input 
						className="hero-admin-submit button" 
						type="submit" 
						value={isSubmitting ? "Saving..." : (editingHero ? "Save Changes" : "Add Hero Slide")}
						disabled={isSubmitting}
						style={{ flexGrow: 1 }}
					/>
				</div>
			</form>

			<h2 className="hero-admin-title page-heading">Current Heroes</h2>
			<div className="hero-list">
				{heroData.map((hero) => {
					return (
						<div key={hero.id} className="hero">
							<img className="hero-img" src={hero.url} alt={hero.title} />
							<div className="hero-info">
								<h3 className="hero-title">{hero.title}</h3>
								<p className="hero-description">{hero.description}</p>
								<p className="hero-order">Order: {hero.order}</p>
								<div className="item-actions" style={{ display: "flex", gap: "0.5rem", marginTop: "auto", width: "100%" }}>
									<button
										className="hero-edit-btn"
										onClick={() => setEditingHero(hero)}
									>
										Edit
									</button>
									<button
										className="hero-delete-btn"
										onClick={() => onDeleteHero(hero.id, hero.url)}
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
