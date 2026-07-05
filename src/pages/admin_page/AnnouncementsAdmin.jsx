import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { addDoc, collection, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import "../../styles/admin/announcements-admin.scss";

export const AnnouncementsAdmin = () => {
	const [pdfUpload, setPdfUpload] = useState(null);
	const [announcementsData, setAnnouncementsData] = useState([]);
	const [editingAnnouncement, setEditingAnnouncement] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState(null);

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

	useEffect(() => {
		if (editingAnnouncement) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			reset({
				title: editingAnnouncement.title || "",
				content: editingAnnouncement.content || "",
				date: editingAnnouncement.date ? editingAnnouncement.date.toISOString().split("T")[0] : "",
			});
		} else {
			reset({
				title: "",
				content: "",
				date: "",
			});
		}
	}, [editingAnnouncement, reset]);

	const onAddOrUpdateAnnouncement = async (data) => {
		setIsSubmitting(true);
		setSuccessMessage(null);

		try {
			let pdfUrl = editingAnnouncement?.pdfUrl || null;
			let pdfName = editingAnnouncement?.pdfName || null;

			if (pdfUpload) {
				const uniquePdfName = `${Date.now()}_${pdfUpload.name}`;
				const storageRef = ref(storage, `announcements/${uniquePdfName}`);
				const snapshot = await uploadBytes(storageRef, pdfUpload);
				pdfUrl = await getDownloadURL(snapshot.ref);
				pdfName = pdfUpload.name;

				// Delete old PDF if editing and exists
				if (editingAnnouncement?.pdfUrl) {
					const oldUrl = editingAnnouncement.pdfUrl;
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
				content: data.content,
				date: new Date(data.date),
				pdfUrl,
				pdfName,
				updatedAt: new Date()
			};

			if (editingAnnouncement) {
				await updateDoc(doc(db, "announcements", editingAnnouncement.id), preparedData);
				setSuccessMessage(`Announcement "${data.title}" updated successfully!`);
				setEditingAnnouncement(null);
			} else {
				preparedData.createdAt = new Date();
				await addDoc(announcementsRef, preparedData);
				setSuccessMessage(`Announcement "${data.title}" created successfully!`);
			}

			reset();
			setPdfUpload(null);
			const fileInput = document.querySelector('input[type="file"]');
			if (fileInput) fileInput.value = "";

			sessionStorage.removeItem("announcements_data");
			sessionStorage.removeItem("home_announcements");

			fetchAnnouncements();

			setTimeout(() => {
				setSuccessMessage(null);
			}, 4000);
		} catch (error) {
			console.error("Error saving announcement:", error);
			alert("Failed to save announcement.");
		}
		setIsSubmitting(false);
	};

	const onDeleteAnnouncement = async (id, pdfUrl) => {
		if (!window.confirm("Are you sure you want to delete this announcement?")) return;

		try {
			if (pdfUrl && pdfUrl.includes("firebasestorage.googleapis.com")) {
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
			sessionStorage.removeItem("home_announcements");
			fetchAnnouncements();
			setSuccessMessage("Announcement deleted successfully.");
			setTimeout(() => setSuccessMessage(null), 4000);
		} catch (error) {
			console.error("Error deleting announcement:", error);
		}
	};

	return (
		<div className="announcements-admin">
			<h2 className="announcements-admin-title page-heading">
				{editingAnnouncement ? "Edit Announcement" : "Add Announcement"}
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

			<form className="announcements-admin-form" onSubmit={handleSubmit(onAddOrUpdateAnnouncement)}>
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

				<div className="file-upload-group" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
					<label style={{ fontWeight: "600", fontSize: "0.9rem" }}>
						Upload PDF Attachment {editingAnnouncement && "(Optional if keeping current)"}:
					</label>
					<input
						className="announcements-admin-file"
						type="file"
						accept=".pdf,.doc,.docx"
						onChange={(event) => setPdfUpload(event.target.files[0])}
					/>
				</div>

				{editingAnnouncement?.pdfName && (
					<p style={{ fontSize: "0.85rem", color: "#64748b", margin: "-0.25rem 0 0.5rem 0" }}>
						Current Attachment: <strong>{editingAnnouncement.pdfName}</strong>
					</p>
				)}

				<div className="form-actions" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
					{editingAnnouncement && (
						<button
							type="button"
							className="button button-secondary"
							onClick={() => setEditingAnnouncement(null)}
							disabled={isSubmitting}
							style={{ padding: "0.75rem 1.5rem" }}
						>
							Cancel Edit
						</button>
					)}
					<input 
						className="announcements-admin-submit button" 
						type="submit" 
						value={isSubmitting ? "Submitting..." : (editingAnnouncement ? "Save Changes" : "Add Announcement")} 
						disabled={isSubmitting}
						style={{ flexGrow: 1 }}
					/>
				</div>
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
								<div className="item-actions" style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", width: "100%" }}>
									<button
										className="announcement-edit-btn"
										onClick={() => setEditingAnnouncement(item)}
									>
										Edit
									</button>
									<button
										className="announcement-delete-btn"
										onClick={() => onDeleteAnnouncement(item.id, item.pdfUrl)}
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
