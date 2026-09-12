import React, { useEffect, useState } from "react";
import "../../styles/home/education-section.scss";
import SectionTitle from "./SectionTitle";
import Button from "../general/Button";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

const EducationSection = () => {
	const [items, setItems] = useState([]);

	useEffect(() => {
		const fetchEducation = async () => {
			try {
				const data = await getDocs(collection(db, "education"));
				const mappedData = data.docs
					.map((doc) => {
						const docData = doc.data();
						return {
							...docData,
							id: doc.id,
							date: docData.date?.toDate?.() || new Date(docData.date),
						};
					})
					.sort((a, b) => b.date - a.date)
					.slice(0, 4);
				setItems(mappedData);
			} catch (error) {
				console.error("Error fetching education for home page:", error);
			}
		};
		fetchEducation();
	}, []);

	const BookIcon = () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#d97706"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
			<path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
		</svg>
	);

	const FileIcon = () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="20"
			height="20"
			viewBox="0 0 24 24"
			fill="none"
			stroke="#d97706"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<polyline points="14 2 14 8 20 8" />
			<line x1="16" y1="13" x2="8" y2="13" />
			<line x1="16" y1="17" x2="8" y2="17" />
			<polyline points="10 9 9 9 8 9" />
		</svg>
	);

	const DownloadIcon = () => (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
			style={{ marginRight: "6px", verticalAlign: "middle" }}
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="7 10 12 15 17 10" />
			<line x1="12" y1="15" x2="12" y2="3" />
		</svg>
	);

	return (
		<div className="education-section-home">
			<div className="container">
				<SectionTitle title="Education" text="View All" link="/education" />
				{items.length === 0 ? (
					<div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
						No education content available.
					</div>
				) : (
					<div className="home-education-list">
						{items.map((item) => (
							<div key={item.id} className="home-education-row">
								<div className="edu-icon-title">
									<div className="edu-icon">
										{item.type === "text" ? <BookIcon /> : <FileIcon />}
									</div>
									<div className="edu-meta">
										<h3 className="edu-title">{item.title}</h3>
										<span className="edu-category">{item.category}</span>
									</div>
								</div>
								{item.type === "download" ? (
									<Button href={item.fileUrl} className="edu-download-btn">
										<DownloadIcon />
										Download
									</Button>
								) : (
									<Button url="/education" className="edu-read-btn">
										Read More
									</Button>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default EducationSection;
