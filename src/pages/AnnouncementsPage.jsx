import React, { useEffect, useState } from "react";
import { getDocs, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/announcements/announcements-page.scss";

export const AnnouncementsPage = () => {
	const [announcements, setAnnouncements] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedYear, setSelectedYear] = useState("latest");
	const itemsPerPage = 8;

	// Dynamically calculate years list to keep 2027+ future-proof
	const currentYear = new Date().getFullYear();
	const years = [];
	for (let y = currentYear; y >= 2023; y--) {
		years.push(y);
	}

	useEffect(() => {
		const fetchAnnouncements = async () => {
			setLoading(true);
			try {
				let announcementsQuery;
				const announcementsRef = collection(db, "announcements");

				if (selectedYear === "latest") {
					announcementsQuery = query(
						announcementsRef,
						orderBy("date", "desc"),
						limit(10)
					);
				} else {
					const yearNum = parseInt(selectedYear);
					const startOfYear = new Date(yearNum, 0, 1);
					const endOfYear = new Date(yearNum, 11, 31, 23, 59, 59);

					announcementsQuery = query(
						announcementsRef,
						where("date", ">=", startOfYear),
						where("date", "<=", endOfYear),
						orderBy("date", "desc")
					);
				}

				const data = await getDocs(announcementsQuery);
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
				setAnnouncements(mappedData);
			} catch (error) {
				console.error("Error fetching announcements:", error);
			}
			setLoading(false);
		};
		fetchAnnouncements();
	}, [selectedYear]);

	// Reset page index on filter change
	useEffect(() => {
		setCurrentPage(1);
	}, [selectedYear]);

	// Pagination logic
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentItems = announcements.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(announcements.length / itemsPerPage);

	return (
		<div className="main-content announcements-page">
			<div className="content container">
				<div className="page-title">Announcements</div>

				<div className="announcements-controls">
					<div className="year-filter-box">
						<label htmlFor="year-select">Filter by Year: </label>
						<select 
							id="year-select"
							value={selectedYear}
							onChange={(e) => setSelectedYear(e.target.value)}
						>
							<option value="latest">Recent (Latest 10)</option>
							{years.map((y) => (
								<option key={y} value={y.toString()}>
									{y} Notices
								</option>
							))}
						</select>
					</div>
				</div>
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
						<div className="announcements-list dense-bulletin">
							{currentItems.map((item) => {
								const dateObj = new Date(item.date);
								const day = dateObj.getDate().toString().padStart(2, "0");
								const month = dateObj.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
								const isNew = (new Date() - dateObj) < 7 * 24 * 60 * 60 * 1000; // 7 Days rule

								return (
									<div key={item.id} className="announcement-row">
										{/* Compact Stacked Date Badge */}
										<div className="date-badge">
											<span className="day">{day}</span>
											<span className="month">{month}</span>
										</div>

										{/* Content Text Info Column */}
										<div className="announcement-info">
											<div className="title-row">
												<h3 className="announcement-row-title">{item.title}</h3>
												{isNew && <span className="new-badge">NEW</span>}
											</div>
											<p className="announcement-content-text">{item.content}</p>
											
											{item.pdfUrl && (
												<a 
													href={item.pdfUrl} 
													target="_blank" 
													rel="noopener noreferrer" 
													className="pdf-download-link"
												>
													<svg 
														xmlns="http://www.w3.org/2000/svg" 
														width="14" 
														height="14" 
														viewBox="0 0 24 24" 
														fill="none" 
														stroke="currentColor" 
														strokeWidth="2.5" 
														strokeLinecap="round" 
														strokeLinejoin="round"
														style={{ marginRight: "6px", verticalAlign: "middle" }}
													>
														<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
														<polyline points="7 10 12 15 17 10"/>
														<line x1="12" y1="15" x2="12" y2="3"/>
													</svg>
													Download Attachment ({item.pdfName || "PDF"})
												</a>
											)}
										</div>
									</div>
								);
							})}
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
