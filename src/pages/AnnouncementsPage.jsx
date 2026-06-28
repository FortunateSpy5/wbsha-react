import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/announcements/announcements-page.scss";

export const AnnouncementsPage = () => {
	const [announcements, setAnnouncements] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 8;

	useEffect(() => {
		const cached = sessionStorage.getItem("announcements_data");
		if (cached) {
			const parsed = JSON.parse(cached).map(item => ({
				...item,
				date: new Date(item.date)
			}));
			setAnnouncements(parsed);
		} else {
			const fetchAnnouncements = async () => {
				try {
					const data = await getDocs(collection(db, "announcements"));
					const mappedData = data.docs.map((doc) => {
						const docData = doc.data();
						return {
							...docData,
							id: doc.id,
							date: docData.date?.toDate?.() || new Date(docData.date)
						};
					});
					const sortedData = mappedData.sort((a, b) => b.date - a.date);
					setAnnouncements(sortedData);
					sessionStorage.setItem("announcements_data", JSON.stringify(sortedData));
				} catch (error) {
					console.error("Error fetching announcements:", error);
				}
			};
			fetchAnnouncements();
		}
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
				{announcements.length === 0 ? (
					<div className="loading">Loading announcements...</div>
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
