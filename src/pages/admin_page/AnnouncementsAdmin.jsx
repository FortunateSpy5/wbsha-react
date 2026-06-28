import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../../styles/admin/announcements-admin.scss";

export const AnnouncementsAdmin = () => {
	const [pdfUpload, setPdfUpload] = useState(null);
	const [announcementsData, setAnnouncementsData] = useState([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const announcementsRef = collection(db, "announcements");

	const fetchAnnouncements = async () => {
		try {
			const data = await getDocs(announcementsRef);
			const mappedData = data.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
				date: doc.data().date?.toDate() || new Date(doc.data().date)
			}));
			const sortedData = mappedData.sort((a, b) => b.date - a.date);
			setAnnouncementsData(sortedData);
		} catch (error) {
			console.error("Error fetching announcements:", error);
		}
	};

	useEffect(() => {
		fetchAnnouncements();
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

	const onAddAnnouncement = async (data) => {
		setIsSubmitting(true);

		try {
			let pdfUrl = null;
			let pdfName = null;

			if (pdfUpload) {
				const uniquePdfName = `${Date.now()}_${pdfUpload.name}`;
				const storageRef = ref(storage, `announcements/${uniquePdfName}`);
				const snapshot = await uploadBytes(storageRef, pdfUpload);
				pdfUrl = await getDownloadURL(snapshot.ref);
				pdfName = pdfUpload.name;
			}

			const newDoc = {
				title: data.title,
				content: data.content,
				date: new Date(data.date),
				pdfUrl,
				pdfName,
				createdAt: new Date()
			};

			await addDoc(announcementsRef, newDoc);
			reset();
			setPdfUpload(null);
			const fileInput = document.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = "";

			sessionStorage.removeItem("announcements_data");

			fetchAnnouncements();
		} catch (error) {
			console.error("Error adding announcement:", error);
		}
		setIsSubmitting(false);
	};

	const onDeleteAnnouncement = async (id, pdfUrl) => {
		if (!window.confirm("Are you sure you want to delete this announcement?")) return;

		try {
			if (pdfUrl) {
				const decodedUrl = decodeURIComponent(pdfUrl);
				const parts = decodedUrl.split("/o/");
				if (parts.length > 1) {
					const filePath = parts[1].split("?")[0];
					const storageRef = ref(storage, filePath);
					await deleteObject(storageRef).catch(err => console.warn("PDF file not found in storage, proceeding to delete doc", err));
				}
			}

			await deleteDoc(doc(db, "announcements", id));
			
			sessionStorage.removeItem("announcements_data");

			fetchAnnouncements();
		} catch (error) {
			console.error("Error deleting announcement:", error);
		}
	};

	return (
		<div className="announcements-admin">
			<h2 className="announcements-admin-title page-heading">Add Announcement</h2>
			<form className="announcements-admin-form" onSubmit={handleSubmit(onAddAnnouncement)}>
				<input
					className="announcements-admin-input"
					placeholder="Announcement Title..."
					{...register("title")}
				/>
				<p className="announcements-admin-error">{errors.title?.message}</p>

				<textarea
					className="announcements-admin-input announcements-admin-textarea"
					placeholder="Announcement Content..."
					rows="5"
					{...register("content")}
				/>
				<p className="announcements-admin-error">{errors.content?.message}</p>

				<input
					className="announcements-admin-input"
					type="date"
					{...register("date")}
				/>
				<p className="announcements-admin-error">{errors.date?.message}</p>

				<div className="file-upload-group">
					<label>Upload PDF Attachment (Optional):</label>
					<input
						className="announcements-admin-file"
						type="file"
						accept=".pdf,.doc,.docx"
						onChange={(event) => setPdfUpload(event.target.files[0])}
					/>
				</div>

				<input 
					className="announcements-admin-submit button" 
					type="submit" 
					value={isSubmitting ? "Submitting..." : "Add Announcement"} 
					disabled={isSubmitting}
				/>
			</form>

			<h2 className="announcements-admin-title page-heading">Current Announcements</h2>
			<div className="announcements-list">
				{announcementsData.length === 0 ? (
					<p>No announcements found.</p>
				) : (
					announcementsData.map((item) => (
						<div key={item.id} className="announcement-item">
							<div className="announcement-info">
								<h3 className="announcement-title">{item.title}</h3>
								<p className="announcement-date">Date: {item.date?.toLocaleDateString()}</p>
								{item.pdfUrl && <p className="announcement-file">Attachment: {item.pdfName}</p>}
								<button
									className="announcement-delete-btn"
									onClick={() => onDeleteAnnouncement(item.id, item.pdfUrl)}
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
