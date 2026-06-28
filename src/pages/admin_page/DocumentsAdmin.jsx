import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../../styles/admin/documents-admin.scss";

export const DocumentsAdmin = () => {
	const [fileUpload, setFileUpload] = useState(null);
	const [fileUploadError, setFileUploadError] = useState(null);
	const [documentsData, setDocumentsData] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

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

	const onAddDocument = async (data) => {
		if (!fileUpload) {
			setFileUploadError("File is required");
			return;
		}
		setFileUploadError(null);
		setIsSubmitting(true);

		try {
			const uniqueFileName = `${Date.now()}_${fileUpload.name}`;
			const storageRef = ref(storage, `documents/${uniqueFileName}`);
			const snapshot = await uploadBytes(storageRef, fileUpload);
			const url = await getDownloadURL(snapshot.ref);

			const newDoc = {
				title: data.title,
				category: data.category,
				date: new Date(data.date),
				fileUrl: url,
				fileName: fileUpload.name,
				createdAt: new Date()
			};

			await addDoc(documentsRef, newDoc);
			reset();
			setFileUpload(null);
			const fileInput = document.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = "";

			sessionStorage.removeItem("documents_data");

			fetchDocuments();
		} catch (error) {
			console.error("Error adding document:", error);
		}
		setIsSubmitting(false);
	};

	const onDeleteDocument = async (id, fileUrl) => {
		if (!window.confirm("Are you sure you want to delete this document?")) return;

		try {
			const decodedUrl = decodeURIComponent(fileUrl);
			const parts = decodedUrl.split("/o/");
			if (parts.length > 1) {
				const filePath = parts[1].split("?")[0];
				const storageRef = ref(storage, filePath);
				await deleteObject(storageRef).catch(err => console.warn("Document file not found in storage, proceeding to delete doc", err));
			}

			await deleteDoc(doc(db, "documents", id));
			
			sessionStorage.removeItem("documents_data");

			fetchDocuments();
		} catch (error) {
			console.error("Error deleting document:", error);
		}
	};

	return (
		<div className="documents-admin">
			<h2 className="documents-admin-title page-heading">Add Official Document</h2>
			<form className="documents-admin-form" onSubmit={handleSubmit(onAddDocument)}>
				<input
					className="documents-admin-input"
					placeholder="Document Title..."
					{...register("title")}
				/>
				<p className="documents-admin-error">{errors.title?.message}</p>

				<input
					className="documents-admin-input"
					placeholder="Category (e.g. Circulars, Rules, Forms)..."
					{...register("category")}
				/>
				<p className="documents-admin-error">{errors.category?.message}</p>

				<input
					className="documents-admin-input"
					type="date"
					{...register("date")}
				/>
				<p className="documents-admin-error">{errors.date?.message}</p>

				<div className="file-upload-group">
					<label>Select Document File (PDF, DOC, XLS etc.):</label>
					<input
						className="documents-admin-file"
						type="file"
						onChange={(event) => setFileUpload(event.target.files[0])}
					/>
				</div>
				{fileUploadError && (
					<p className="documents-admin-error">{fileUploadError}</p>
				)}

				<input 
					className="documents-admin-submit button" 
					type="submit" 
					value={isSubmitting ? "Uploading..." : "Add Document"} 
					disabled={isSubmitting}
				/>
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
								<p className="document-file">File: {item.fileName}</p>
								<button
									className="document-delete-btn"
									onClick={() => onDeleteDocument(item.id, item.fileUrl)}
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
