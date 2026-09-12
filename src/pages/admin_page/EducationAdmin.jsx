import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../../styles/admin/education-admin.scss";

export const EducationAdmin = () => {
	const [fileUpload, setFileUpload] = useState(null);
	const [fileUploadError, setFileUploadError] = useState(null);
	const [educationData, setEducationData] = useState([]);
	const [editingItem, setEditingItem] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState(null);
	const [selectedType, setSelectedType] = useState("text");

	const educationRef = collection(db, "education");

	const fetchEducation = async () => {
		try {
			const data = await getDocs(educationRef);
			const mappedData = data.docs
				.map((docSnap) => ({
					...docSnap.data(),
					id: docSnap.id,
					date: docSnap.data().date?.toDate() || new Date(docSnap.data().date),
				}))
				.sort((a, b) => b.date - a.date);
			setEducationData(mappedData);
		} catch (error) {
			console.error("Error fetching education content:", error);
		}
	};

	useEffect(() => {
		fetchEducation();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const schema = yup.object().shape({
		title: yup.string().required("Title is required"),
		category: yup.string().required("Category is required"),
		date: yup.date().required("Date is required"),
		description: yup.string().when([], {
			is: () => selectedType === "text",
			then: (s) => s.required("Description is required for text sections"),
			otherwise: (s) => s.optional(),
		}),
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
		if (editingItem) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			setSelectedType(editingItem.type || "text");
			reset({
				title: editingItem.title || "",
				category: editingItem.category || "",
				date: editingItem.date ? editingItem.date.toISOString().split("T")[0] : "",
				description: editingItem.description || "",
			});
		} else {
			setSelectedType("text");
			reset({ title: "", category: "", date: "", description: "" });
		}
	}, [editingItem, reset]);

	const onAddOrUpdate = async (data) => {
		if (selectedType === "download" && !fileUpload && !editingItem) {
			setFileUploadError("File is required for downloadable resources");
			return;
		}
		setFileUploadError(null);
		setIsSubmitting(true);
		setSuccessMessage(null);

		try {
			let fileUrl = editingItem?.fileUrl || null;
			let fileName = editingItem?.fileName || null;

			if (selectedType === "download" && fileUpload) {
				const uniqueName = `${Date.now()}_${fileUpload.name}`;
				const storageRef = ref(storage, `education/${uniqueName}`);
				const snapshot = await uploadBytes(storageRef, fileUpload);
				fileUrl = await getDownloadURL(snapshot.ref);
				fileName = fileUpload.name;

				if (editingItem?.fileUrl) {
					const oldUrl = editingItem.fileUrl;
					if (oldUrl.includes("firebasestorage.googleapis.com")) {
						const decodedUrl = decodeURIComponent(oldUrl);
						const parts = decodedUrl.split("/o/");
						if (parts.length > 1) {
							const filePath = parts[1].split("?")[0];
							await deleteObject(ref(storage, filePath)).catch((err) =>
								console.warn("Could not delete old file:", err)
							);
						}
					}
				}
			}

			const preparedData = {
				type: selectedType,
				title: data.title,
				category: data.category,
				date: new Date(data.date),
				updatedAt: new Date(),
			};

			if (selectedType === "text") {
				preparedData.description = data.description || "";
				// Clear download fields if switching from download to text
				preparedData.fileUrl = null;
				preparedData.fileName = null;
			} else {
				preparedData.fileUrl = fileUrl;
				preparedData.fileName = fileName;
				// Clear text fields if switching from text to download
				preparedData.description = "";
			}

			if (editingItem) {
				await updateDoc(doc(db, "education", editingItem.id), preparedData);
				setSuccessMessage(`"${data.title}" updated successfully!`);
				setEditingItem(null);
			} else {
				preparedData.createdAt = new Date();
				await addDoc(educationRef, preparedData);
				setSuccessMessage(`"${data.title}" added successfully!`);
			}

			reset();
			setFileUpload(null);
			setSelectedType("text");
			const fileInput = document.querySelector(".education-admin input[type=\"file\"]");
			if (fileInput) fileInput.value = "";

			fetchEducation();

			setTimeout(() => setSuccessMessage(null), 4000);
		} catch (error) {
			console.error("Error saving education content:", error);
			alert("Failed to save education content. Please try again.");
		}
		setIsSubmitting(false);
	};

	const onDelete = async (id, fileUrl) => {
		if (!window.confirm("Are you sure you want to delete this item?")) return;

		try {
			if (fileUrl && fileUrl.includes("firebasestorage.googleapis.com")) {
				const decodedUrl = decodeURIComponent(fileUrl);
				const parts = decodedUrl.split("/o/");
				if (parts.length > 1) {
					const filePath = parts[1].split("?")[0];
					await deleteObject(ref(storage, filePath)).catch((err) =>
						console.warn("File not found in storage:", err)
					);
				}
			}
			await deleteDoc(doc(db, "education", id));
			fetchEducation();
			setSuccessMessage("Item deleted successfully.");
			setTimeout(() => setSuccessMessage(null), 4000);
		} catch (error) {
			console.error("Error deleting education item:", error);
		}
	};

	return (
		<div className="education-admin">
			<h2 className="education-admin-title page-heading">
				{editingItem ? "Edit Education Item" : "Add Education Content"}
			</h2>

			{successMessage && (
				<div
					className="admin-success-banner"
					style={{
						background: "#d1fae5",
						color: "#065f46",
						padding: "1rem",
						borderRadius: "4px",
						marginBottom: "1.5rem",
						fontWeight: "600",
						border: "1px solid #a7f3d0",
					}}
				>
					✅ {successMessage}
				</div>
			)}

			<form className="education-admin-form" onSubmit={handleSubmit(onAddOrUpdate)}>
				{/* TYPE SELECTOR */}
				<div className="form-group">
					<label htmlFor="edu-type">Content Type</label>
					<select
						id="edu-type"
						className="education-admin-input"
						value={selectedType}
						onChange={(e) => setSelectedType(e.target.value)}
						disabled={!!editingItem}
					>
						<option value="text">📖 Text Section</option>
						<option value="download">📄 Downloadable Resource</option>
					</select>
					{editingItem && (
						<p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.25rem 0 0 0" }}>
							Content type cannot be changed while editing.
						</p>
					)}
				</div>

				{/* COMMON FIELDS */}
				<input
					className="education-admin-input"
					placeholder="Title..."
					{...register("title")}
				/>
				<p className="education-admin-error">{errors.title?.message}</p>

				<input
					className="education-admin-input"
					placeholder="Category (e.g. Coaching, Rules, Training)..."
					{...register("category")}
				/>
				<p className="education-admin-error">{errors.category?.message}</p>

				<input
					className="education-admin-input"
					type="date"
					{...register("date")}
				/>
				<p className="education-admin-error">{errors.date?.message}</p>

				{/* CONDITIONAL: TEXT TYPE */}
				{selectedType === "text" && (
					<div className="form-group">
						<label htmlFor="edu-desc">
							Description{" "}
							<span style={{ fontWeight: 400, color: "#64748b" }}>
								(Press Enter for new paragraphs)
							</span>
						</label>
						<textarea
							id="edu-desc"
							className="education-admin-input education-admin-textarea"
							placeholder="Write the section content here..."
							rows="7"
							{...register("description")}
						/>
						<p className="education-admin-error">{errors.description?.message}</p>
					</div>
				)}

				{/* CONDITIONAL: DOWNLOAD TYPE */}
				{selectedType === "download" && (
					<div className="form-group">
						<label>
							Select File{" "}
							{editingItem && (
								<span style={{ fontWeight: 400, color: "#64748b" }}>(Optional if keeping current)</span>
							)}
						</label>
						<input
							className="education-admin-file"
							type="file"
							onChange={(e) => setFileUpload(e.target.files[0])}
						/>
						{fileUploadError && (
							<p className="education-admin-error">{fileUploadError}</p>
						)}
						{editingItem?.fileName && (
							<p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.25rem 0 0 0" }}>
								Current File: <strong>{editingItem.fileName}</strong>
							</p>
						)}
					</div>
				)}

				{/* FORM ACTIONS */}
				<div className="form-actions" style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
					{editingItem && (
						<button
							type="button"
							className="button button-secondary"
							onClick={() => setEditingItem(null)}
							disabled={isSubmitting}
							style={{ padding: "0.75rem 1.5rem" }}
						>
							Cancel Edit
						</button>
					)}
					<input
						className="education-admin-submit button"
						type="submit"
						value={
							isSubmitting
								? "Saving..."
								: editingItem
								? "Save Changes"
								: "Add Content"
						}
						disabled={isSubmitting}
						style={{ flexGrow: 1 }}
					/>
				</div>
			</form>

			{/* EXISTING ITEMS LIST */}
			<h2 className="education-admin-title page-heading">Current Education Content</h2>
			<div className="education-items-list">
				{educationData.length === 0 ? (
					<p>No education content found.</p>
				) : (
					educationData.map((item) => (
						<div key={item.id} className="education-item">
							<div className="item-info">
								<span className="item-type-badge">
									{item.type === "text" ? "📖 Text Section" : "📄 Downloadable File"}
								</span>
								<h3 className="item-title">{item.title}</h3>
								<p className="item-category">Category: {item.category}</p>
								<p className="item-date">Date: {item.date?.toLocaleDateString()}</p>
								{item.type === "text" && item.description && (
									<p className="item-description-preview">
										{item.description.substring(0, 120)}
										{item.description.length > 120 ? "..." : ""}
									</p>
								)}
								{item.type === "download" && item.fileName && (
									<p className="item-file">File: {item.fileName}</p>
								)}
							</div>
							<div className="item-actions" style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
								<button className="item-edit-btn" onClick={() => setEditingItem(item)}>
									Edit
								</button>
								<button
									className="item-delete-btn"
									onClick={() => onDelete(item.id, item.fileUrl)}
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
