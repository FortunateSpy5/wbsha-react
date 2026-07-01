import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import "../../styles/admin/contact-submissions-admin.scss";

export const ContactSubmissionsAdmin = () => {
	const [submissions, setSubmissions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSubmission, setSelectedSubmission] = useState(null);

	const submissionsRef = collection(db, "contactSubmissions");

	const fetchSubmissions = async () => {
		setLoading(true);
		try {
			const data = await getDocs(submissionsRef);
			const mappedData = data.docs.map((doc) => {
				const docData = doc.data();
				return {
					...docData,
					id: doc.id,
					date: docData.date ? new Date(docData.date) : new Date(),
				};
			});
			// Sort descending by date
			const sortedData = mappedData.sort((a, b) => b.date - a.date);
			setSubmissions(sortedData);
		} catch (error) {
			console.error("Error fetching submissions:", error);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchSubmissions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const onDeleteSubmission = async (id) => {
		if (!window.confirm("Are you sure you want to delete this submission?")) return;
		try {
			await deleteDoc(doc(db, "contactSubmissions", id));
			setSubmissions((prev) => prev.filter((item) => item.id !== id));
			if (selectedSubmission?.id === id) {
				setSelectedSubmission(null);
			}
		} catch (error) {
			console.error("Error deleting submission:", error);
		}
	};

	const filteredSubmissions = submissions.filter((sub) => {
		const searchLower = searchTerm.toLowerCase();
		return (
			sub.name?.toLowerCase().includes(searchLower) ||
			sub.email?.toLowerCase().includes(searchLower) ||
			sub.subject?.toLowerCase().includes(searchLower) ||
			sub.message?.toLowerCase().includes(searchLower)
		);
	});

	return (
		<div className="contact-submissions-admin">
			<h2 className="workspace-heading">Contact Us Form Submissions</h2>

			<div className="admin-actions-bar">
				<input
					type="text"
					className="submissions-search-input"
					placeholder="Search submissions by name, email, keyword..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
				/>
				<button className="refresh-btn button" onClick={fetchSubmissions}>
					🔄 Refresh
				</button>
			</div>

			{loading ? (
				<p style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading submissions...</p>
			) : filteredSubmissions.length === 0 ? (
				<p style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
					{searchTerm ? "No submissions match your search query." : "No contact form submissions found."}
				</p>
			) : (
				<div className="submissions-layout">
					<div className="submissions-list-pane">
						{filteredSubmissions.map((sub) => (
							<div
								key={sub.id}
								className={`submission-item-card ${selectedSubmission?.id === sub.id ? "selected" : ""}`}
								onClick={() => setSelectedSubmission(sub)}
							>
								<div className="card-header">
									<h3 className="sender-name">{sub.name}</h3>
									<span className="submission-date">
										{sub.date.toLocaleDateString(undefined, {
											month: "short",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
								<div className="sender-email">{sub.email}</div>
								<div className="submission-subject">
									<strong>Subject:</strong> {sub.subject}
								</div>
								<div className="card-actions">
									<button
										className="delete-sub-btn"
										onClick={(e) => {
											e.stopPropagation();
											onDeleteSubmission(sub.id);
										}}
									>
										🗑️ Delete
									</button>
								</div>
							</div>
						))}
					</div>

					<div className="submission-detail-pane">
						{selectedSubmission ? (
							<div className="submission-detail-card">
								<div className="detail-header">
									<h2>Submission Details</h2>
									<button className="delete-sub-btn-large" onClick={() => onDeleteSubmission(selectedSubmission.id)}>
										🗑️ Delete Submission
									</button>
								</div>
								<div className="detail-meta-grid">
									<div>
										<strong>From:</strong> {selectedSubmission.name}
									</div>
									<div>
										<strong>Email:</strong>{" "}
										<a href={`mailto:${selectedSubmission.email}`} className="email-link">
											{selectedSubmission.email}
										</a>
									</div>
									<div>
										<strong>Submitted:</strong>{" "}
										{selectedSubmission.date.toLocaleString(undefined, {
											weekday: "long",
											year: "numeric",
											month: "long",
											day: "numeric",
											hour: "2-digit",
											minute: "2-digit",
										})}
									</div>
								</div>
								<div className="detail-subject">
									<strong>Subject:</strong> {selectedSubmission.subject}
								</div>
								<div className="detail-message-body">
									<h3>Message:</h3>
									<div className="message-content">{selectedSubmission.message}</div>
								</div>
								<div className="detail-reply-action">
									<a
										href={`mailto:${selectedSubmission.email}?subject=RE: ${encodeURIComponent(selectedSubmission.subject)}`}
										className="reply-btn button"
									>
										✉️ Reply via Email
									</a>
								</div>
							</div>
						) : (
							<div className="no-detail-selected">
								<div className="info-icon">✉️</div>
								<p>Select a submission from the list to view its full contents and reply.</p>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};
