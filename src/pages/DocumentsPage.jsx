import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/documents/documents-page.scss";

export const DocumentsPage = () => {
	const [documents, setDocuments] = useState([]);
	const [categories, setCategories] = useState([]);
	const [selectedCategory, setSelectedCategory] = useState("All");

	useEffect(() => {
		const cached = sessionStorage.getItem("documents_data");
		if (cached) {
			const parsed = JSON.parse(cached);
			setDocuments(parsed);
			const uniqueCategories = ["All", ...new Set(parsed.map((doc) => doc.category))];
			setCategories(uniqueCategories);
		} else {
			const fetchDocuments = async () => {
				try {
					const data = await getDocs(collection(db, "documents"));
					const mappedData = data.docs.map((doc) => ({
						...doc.data(),
						id: doc.id,
						date: doc.data().date?.toDate() || new Date(doc.data().date)
					}));
					// Sort by date descending
					const sortedData = mappedData.sort((a, b) => b.date - a.date);
					setDocuments(sortedData);
					sessionStorage.setItem("documents_data", JSON.stringify(sortedData));

					const uniqueCategories = ["All", ...new Set(sortedData.map((doc) => doc.category))];
					setCategories(uniqueCategories);
				} catch (error) {
					console.error("Error fetching documents:", error);
				}
			};
			fetchDocuments();
		}
	}, []);

	const filteredDocuments = selectedCategory === "All"
		? documents
		: documents.filter((doc) => doc.category === selectedCategory);

	return (
		<div className="main-content documents-page">
			<div className="content container">
				<div className="page-title">Official Documents</div>
				{documents.length === 0 ? (
					<div className="loading">Loading documents...</div>
				) : (
					<>
						<div className="category-filters">
							{categories.map((category) => (
								<button
									key={category}
									className={`filter-btn ${selectedCategory === category ? "active" : ""}`}
									onClick={() => setSelectedCategory(category)}
								>
									{category}
								</button>
							))}
						</div>

						<div className="documents-list">
							{filteredDocuments.map((docItem, index) => (
								<div key={docItem.id || index} className="document-row">
									<div className="document-info">
										<h3 className="document-title">{docItem.title}</h3>
										<div className="document-meta">
											<span className="category-badge">{docItem.category}</span>
											<span className="document-date">
												{new Date(docItem.date).toLocaleDateString()}
											</span>
										</div>
									</div>
									<a
										href={docItem.fileUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="download-btn button"
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
											style={{ marginRight: "6px", verticalAlign: "middle" }}
										>
											<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
											<polyline points="7 10 12 15 17 10" />
											<line x1="12" y1="15" x2="12" y2="3" />
										</svg>
										Download
									</a>
								</div>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
};
