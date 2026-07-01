import React, { useEffect, useState } from "react";
import "../../styles/home/documents-section.scss";
import SectionTitle from "./SectionTitle";
import Button from "../general/Button";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

const DocumentsSection = () => {
	const [documents, setDocuments] = useState([]);

	useEffect(() => {
		const fetchDocuments = async () => {
			try {
				const data = await getDocs(collection(db, "documents"));
				const mappedData = data.docs.map((doc) => {
					const docData = doc.data();
					return {
						...docData,
						id: doc.id,
						date: docData.date?.toDate?.() || new Date(docData.date)
					};
				});
				const sortedData = mappedData.sort((a, b) => b.date - a.date).slice(0, 4);
				setDocuments(sortedData);
			} catch (error) {
				console.error("Error fetching documents for home page:", error);
			}
		};
		fetchDocuments();
	}, []);

	return (
		<div className="documents-section-home">
			<div className="container">
				<SectionTitle title="Documents" text="Official Archives" link="/documents" />
				{documents.length === 0 ? (
					<div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
						No documents available.
					</div>
				) : (
					<div className="home-documents-list">
						{documents.map((docItem) => (
							<div key={docItem.id} className="home-document-row">
								<div className="doc-icon-title">
									<div className="doc-icon">
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: "#009df7"}}>
											<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
											<polyline points="14 2 14 8 20 8" />
											<line x1="16" y1="13" x2="8" y2="13" />
											<line x1="16" y1="17" x2="8" y2="17" />
											<polyline points="10 9 9 9 8 9" />
										</svg>
									</div>
									<div className="doc-meta">
										<h3 className="doc-title">{docItem.title}</h3>
										<span className="doc-category">{docItem.category}</span>
									</div>
								</div>
								<Button
									href={docItem.fileUrl}
									className="doc-download-btn"
								>
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
									Download
								</Button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default DocumentsSection;
