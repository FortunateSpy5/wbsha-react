import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import Button from "./general/Button";
import "../styles/education/education-page.scss";

export const EducationPage = () => {
	const [educationItems, setEducationItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState("All");

	useEffect(() => {
		const fetchEducation = async () => {
			try {
				const data = await getDocs(collection(db, "education"));
				const mappedData = data.docs.map((doc) => ({
					...doc.data(),
					id: doc.id,
					date: doc.data().date?.toDate() || new Date(doc.data().date),
				}));
				const sortedData = mappedData.sort((a, b) => b.date - a.date);
				setEducationItems(sortedData);
				const uniqueCategories = ["All", ...new Set(sortedData.map((item) => item.category).filter(Boolean))];
				setCategories(uniqueCategories);
			} catch (error) {
				console.error("Error fetching education content:", error);
			}
			setLoading(false);
		};
		fetchEducation();
	}, []);

	const filteredItems =
		selectedCategory === "All"
			? educationItems
			: educationItems.filter((item) => item.category === selectedCategory);

	const DownloadIcon = () => (
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
			style={{ marginRight: "6px", verticalAlign: "middle" }}
		>
			<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
			<polyline points="7 10 12 15 17 10" />
			<line x1="12" y1="15" x2="12" y2="3" />
		</svg>
	);

	return (
		<div className="main-content education-page">
			<div className="content container">
				<div className="page-title">Education</div>

				{loading ? (
					<div className="skeleton-education-list">
						{[...Array(4)].map((_, i) => (
							<div key={i} className="skeleton-education-row">
								<div className="skeleton-info">
									<div className="skeleton-title" />
									<div className="skeleton-meta" />
								</div>
								<div className="skeleton-btn" />
							</div>
						))}
					</div>
				) : educationItems.length === 0 ? (
					<div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
						No education content found.
					</div>
				) : (
					<>
						<div className="category-filters">
							{categories.map((cat) => (
								<button
									key={cat}
									className={`filter-btn ${selectedCategory === cat ? "active" : ""}`}
									onClick={() => setSelectedCategory(cat)}
								>
									{cat}
								</button>
							))}
						</div>

						<div className="education-list">
							{filteredItems.map((item) =>
								item.type === "text" ? (
									<div key={item.id} className="education-text-block">
										<div className="text-block-header">
											<h3 className="text-block-title">{item.title}</h3>
											<div className="text-block-meta">
												<span className="category-badge">{item.category}</span>
												<span className="text-block-date">
													{new Date(item.date).toLocaleDateString()}
												</span>
											</div>
										</div>
										{item.description && (
											<div className="text-block-content">
												{item.description.split("\n").map((para, idx) =>
													para.trim() ? <p key={idx}>{para.trim()}</p> : null
												)}
											</div>
										)}
									</div>
								) : (
									<div key={item.id} className="education-download-row">
										<div className="document-info">
											<h3 className="document-title">{item.title}</h3>
											<div className="document-meta">
												<span className="category-badge">{item.category}</span>
												<span className="document-date">
													{new Date(item.date).toLocaleDateString()}
												</span>
											</div>
										</div>
										<Button href={item.fileUrl} className="download-btn">
											<DownloadIcon />
											Download
										</Button>
									</div>
								)
							)}
						</div>
					</>
				)}
			</div>
		</div>
	);
};
