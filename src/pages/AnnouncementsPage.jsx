import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/announcements/announcements-page.scss";

export const AnnouncementsPage = () => {
	const [announcements, setAnnouncements] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	useEffect(() => {
		const fetchAnnouncements = async () => {
			try {
				const data = await getDocs(collection(db, "announcements"));
				const mappedData = data.docs.map((doc) => {
					const docData = doc.data();
					let parsedDate = new Date();
					if (docData.date) {
						parsedDate = docData.date.toDate ? docData.date.toDate() : new Date(docData.date);
					}
					return {
						...docData,
						id: doc.id,
						date: parsedDate
					};
				});
				const sortedData = mappedData
					.filter(item => item.date && !isNaN(item.date.getTime()))
					.sort((a, b) => b.date - a.date);
				setAnnouncements(sortedData);
			} catch (error) {
				console.error("Error fetching announcements:", error);
			}
			setLoading(false);
		};
		fetchAnnouncements();
	}, []);

	// Pagination logic
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = announcements.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(announcements.length / itemsPerPage);

	return (
		<div className="main-content announcements-page">
			<div className="content container">
				<div className="page-title">Announcements</div>
				{loading ? (
					<div className="skeleton-announcements-list">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="skeleton-announcement-card">
								<div className="skeleton-top" />
								<div className="skeleton-title" />
								<div className="skeleton-excerpt" />
								<div className="skeleton-link" />
							</div>
						))}
					</div>
				) : announcements.length === 0 ? (
					<div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
						No announcements found.
					</div>
				) : (
					<>
						<div className="announcements-list">
							{currentItems.map((item) => (
								<div key={item.id} className="announcement-card">
									<div className="announcement-header">
										<h3 className="announcement-title">{item.title}</h3>
										<span className="announcement-date">
											{new Date(item.date).toLocaleDateString(undefined, {
												year: 'numeric',
												month: 'long',
												day: 'numeric'
											})}
										</span>
									</div>
									<p className="announcement-content">{item.content}</p>
									{item.pdfUrl && (
										<a
											href={item.pdfUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="pdf-download-btn button"
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												width="16"
												height="16"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												strokeLinecap="round"
												strokeLinejoin="round"
												style={{ marginRight: "8px", verticalAlign: "middle" }}
											>
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
												<polyline points="7 10 12 15 17 10" />
												<line x1="12" y1="15" x2="12" y2="3" />
											</svg>
											Download Attachment ({item.pdfName || "PDF"})
										</a>
									)}
								</div>
							))}
						</div>
						
						{totalPages > 1 && (
							<div className="pagination">
								<button 
									className="button btn-prev" 
									onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
								>
									Previous
								</button>
								<span className="page-number">Page {currentPage} of {totalPages}</span>
								<button 
									className="button btn-next" 
									onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
									disabled={currentPage === totalPages}
								>
									Next
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};
