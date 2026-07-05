import React, { useEffect, useState } from "react";
import "../../styles/home/announcements-section.scss";
import SectionTitle from "./SectionTitle";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

const AnnouncementsSection = () => {
	const [announcements, setAnnouncements] = useState([]);

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
					.sort((a, b) => b.date - a.date)
					.slice(0, 3);
				setAnnouncements(sortedData);
			} catch (error) {
				console.error("Error fetching announcements for home page:", error);
			}
		};
		fetchAnnouncements();
	}, []);

	return (
		<div className="announcements-section">
			<div className="container">
				<SectionTitle title="Announcements" text="All Announcements" link="/announcements" />
				{announcements.length === 0 ? (
					<div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
						No announcements available.
					</div>
				) : (
					<div className="announcements-grid-home">
						{announcements.map((item) => {
							const isNew = (new Date() - new Date(item.date)) < 7 * 24 * 60 * 60 * 1000;

							return (
								<div key={item.id} className="home-announcement-card">
									<div className="card-top">
										<span className="date-badge">
											{new Date(item.date).toLocaleDateString(undefined, {
												month: "short",
												day: "numeric",
												year: "numeric"
											})}
										</span>
										{isNew && <span className="new-badge">NEW</span>}
									</div>
									<h3 className="announcement-card-title">{item.title}</h3>
									<p className="announcement-excerpt">
										{item.content.length > 120 ? `${item.content.substring(0, 120)}...` : item.content}
									</p>
									{item.pdfUrl && (
										<a
											href={item.pdfUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="download-link"
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
												<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
												<polyline points="7 10 12 15 17 10" />
												<line x1="12" y1="15" x2="12" y2="3" />
											</svg>
											Download PDF
										</a>
									)}
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default AnnouncementsSection;
