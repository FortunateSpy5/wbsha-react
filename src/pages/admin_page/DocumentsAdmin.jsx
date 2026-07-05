import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../../styles/admin/documents-admin.scss";

export const DocumentsAdmin = () => {
	const [fileUpload, setFileUpload] = useState(null);
	const [fileUploadError, setFileUploadError] = useState(null);
	const [documentsData, setDocumentsData] = useState([]);
	const [editingDocument, setEditingDocument] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState(null);

	const documentsRef = collection(db, "documents");

	const fetchDocuments = async () => {
		try {
			const data = await getDocs(documentsRef);
			const mappedData = data.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
				date: doc.data().date?.toDate() || new Date(doc.data().date)
			}));
			const sortedData = mappedData.sort((a, b) => b.date - a.date);
			setDocumentsData(sortedData);
		} catch (error) {
			console.error("Error fetching documents:", error);
		}
	};

	useEffect(() => {
		fetchDocuments();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const schema = yup.object().shape({
		title: yup.string().required("Title is required"),
		category: yup.string().required("Category is required"),
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

	useEffect(() => {
		if (editingDocument) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			reset({
				title: editingDocument.title || "",
				category: editingDocument.category || "",
				date: editingDocument.date ? editingDocument.date.toISOString().split("T")[0] : "",
			});
		} else {
			reset({
				title: "",
				category: "",
				date: "",
			});
		}
	}, [editingDocument, reset]);

	const onAddOrUpdateDocument = async (data) => {
		if (!fileUpload && !editingDocument) {
			setFileUploadError("File is required");
			return;
		}
		setFileUploadError(null);
		setIsSubmitting(true);
		setSuccessMessage(null);

		try {
			let fileUrl = editingDocument?.fileUrl || null;
			let fileName = editingDocument?.fileName || null;

			if (fileUpload) {
				const uniqueFileName = `${Date.now()}_${fileUpload.name}`;
				const storageRef = ref(storage, `documents/${uniqueFileName}`);
				const snapshot = await uploadBytes(storageRef, fileUpload);
				fileUrl = await getDownloadURL(snapshot.ref);
				fileName = fileUpload.name;

				// Delete old file if editing and exists
				if (editingDocument?.fileUrl) {
					const oldUrl = editingDocument.fileUrl;
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
				category: data.category,
				date: new Date(data.date),
				fileUrl,
				fileName,
				updatedAt: new Date()
			};

			if (editingDocument) {
				await updateDoc(doc(db, "documents", editingDocument.id), preparedData);
				setSuccessMessage(`Document "${data.title}" updated successfully!`);
				setEditingDocument(null);
			} else {
				preparedData.createdAt = new Date();
				await addDoc(documentsRef, preparedData);
				setSuccessMessage(`Document "${data.title}" created successfully!`);
			}

			reset();
			setFileUpload(null);
			const fileInput = document.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = "";

			sessionStorage.removeItem("documents_data");
			sessionStorage.removeItem("home_documents");

			fetchDocuments();

			setTimeout(() => {
				setSuccessMessage(null);
			}, 4000);
		} catch (error) {
			console.error("Error saving document:", error);
			alert("Failed to save document.");
		}
		setIsSubmitting(false);
	};

	const onDeleteDocument = async (id, fileUrl) => {
		if (!window.confirm("Are you sure you want to delete this document?")) return;

		try {
			if (fileUrl && fileUrl.includes("firebasestorage.googleapis.com")) {
				const decodedUrl = decodeURIComponent(fileUrl);
				const parts = decodedUrl.split("/o/");
				if (parts.length > 1) {
					const filePath = parts[1].split("?")[0];
					const storageRef = ref(storage, filePath);
					await deleteObject(storageRef).catch(err => console.warn("File not found in storage, proceeding to delete doc", err));
				}
			}

			await deleteDoc(doc(db, "documents", id));
			sessionStorage.removeItem("documents_data");
			sessionStorage.removeItem("home_documents");
			fetchDocuments();
			setSuccessMessage("Document deleted successfully.");
			setTimeout(() => setSuccessMessage(null), 4000);
		} catch (error) {
			console.error("Error deleting document:", error);
		}
	};

	return (
		<div className="documents-admin">
			<h2 className="documents-admin-title page-heading">
				{editingDocument ? "Edit Document" : "Add Official Document"}
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

			<form className="documents-admin-form" onSubmit={handleSubmit(onAddOrUpdateDocument)}>
				<input
					className="documents-admin-input"
					placeholder="Title..."
					{...register("title")}
				/>
				<p className="documents-admin-error">{errors.title?.message}</p>

				<input
					className="documents-admin-input"
					placeholder="Category..."
					{...register("category")}
				/>
				<p className="documents-admin-error">{errors.category?.message}</p>

				<input
					className="documents-admin-input"
					type="date"
					{...register("date")}
				/>
				<p className="documents-admin-error">{errors.date?.message}</p>

				<div className="file-upload-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
					<label style={{ fontWeight: "600", fontSize: "0.9rem" }}>
						Select Document File {editingDocument && "(Optional if keeping current)"}:
					</label>
					<input
						className="documents-admin-file"
						type="file"
						onChange={(event) => setFileUpload(event.target.files[0])}
					/>
				</div>
				{fileUploadError && (
					<p className="documents-admin-error">{fileUploadError}</p>
				)}

				{editingDocument?.fileName && (
					<p style={{ fontSize: "0.85rem", color: "#64748b", margin: "-0.25rem 0 0.5rem 0" }}>
						Current File: <strong>{editingDocument.fileName}</strong>
					</p>
				)}

				<div className="form-actions" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
					{editingDocument && (
						<button
							type="button"
							className="button button-secondary"
							onClick={() => setEditingDocument(null)}
							disabled={isSubmitting}
							style={{ padding: "0.75rem 1.5rem" }}
						>
							Cancel Edit
						</button>
					)}
					<input 
						className="documents-admin-submit button" 
						type="submit" 
						value={isSubmitting ? "Uploading..." : (editingDocument ? "Save Changes" : "Add Document")} 
						disabled={isSubmitting}
						style={{ flexGrow: 1 }}
					/>
				</div>
			</form>

			<h2 className="documents-admin-title page-heading">Current Documents</h2>
			<div className="documents-list">
				{documentsData.length === 0 ? (
					<p>No documents found.</p>
				) : (
					documentsData.map((item) => (
						<div key={item.id} className="document-item">
							<div className="document-info">
								<h3 className="document-title">{item.title}</h3>
								<p className="document-category">Category: {item.category}</p>
								<p className="document-date">Date: {item.date?.toLocaleDateString()}</p>
								{item.fileName && <p className="document-file">File: {item.fileName}</p>}
								<div className="item-actions" style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", width: "100%" }}>
									<button
										className="document-edit-btn"
										onClick={() => setEditingDocument(item)}
									>
										Edit
									</button>
									<button
										className="document-delete-btn"
										onClick={() => onDeleteDocument(item.id, item.fileUrl)}
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
