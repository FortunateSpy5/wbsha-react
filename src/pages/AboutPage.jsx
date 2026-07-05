import React, { useEffect, useState } from "react";
import { db } from "../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import "../styles/about/about-page.scss";

export const AboutPage = () => {
	const [sections, setSections] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeImage, setActiveImage] = useState(null);
	const [isZoomed, setIsZoomed] = useState(false);

	useEffect(() => {
		const fetchSections = async () => {
			try {
				const querySnapshot = await getDocs(collection(db, "aboutSections"));
				const mapped = querySnapshot.docs.map((doc) => ({
					...doc.data(),
					id: doc.id,
				}));
				// Sort by order ascending
				mapped.sort((a, b) => (a.order || 0) - (b.order || 0));
				setSections(mapped);
			} catch (error) {
				console.error("Error fetching about page sections:", error);
			}
			setLoading(false);
		};
		fetchSections();
	}, []);

	return (
		<div className="main-content about-page">
			<div className="content container">
				<div className="page-title">About Us</div>
				
				{/* Dynamic Sections */}
				{loading ? (
					<div className="about-sections-loading">
						<div className="skeleton-line title" />
						<div className="skeleton-line paragraph" />
						<div className="skeleton-line paragraph" />
					</div>
				) : (
					<div className="dynamic-sections">
						{sections.map((section) => (
							<div key={section.id} className="about-section">
								<h2 className="page-heading">{section.title}</h2>
								
								{section.description && (
									<div className="section-description">
										{section.description.split("\n").map((para, idx) => (
											para.trim() && <p key={idx}>{para.trim()}</p>
										))}
									</div>
								)}

								{section.type === "members" && section.members && section.members.length > 0 && (
									<div className="members-grid">
										{section.members.map((member) => (
											<div key={member.id} className="member-card">
												<div 
													className={`member-photo-frame ${member.pictureUrl ? "has-photo" : ""}`}
													onClick={() => {
														if (member.pictureUrl) {
															setActiveImage(member.pictureUrl);
															setIsZoomed(false);
														}
													}}
												>
													{member.pictureUrl ? (
														<img src={member.pictureUrl} alt={member.name} className="member-photo" />
													) : (
														<div className="member-photo-placeholder">
															<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" fill="#94a3b8">
																<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
															</svg>
														</div>
													)}
												</div>
												<div className="member-details">
													<h3 className="member-name">{member.name}</h3>
													{member.role && <span className="member-role">{member.role}</span>}
													{member.description && <p className="member-bio">{member.description}</p>}
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Expanded Image Lightbox Overlay */}
			{activeImage && (
				<div 
					className={`image-lightbox-overlay ${isZoomed ? "zoomed-mode" : ""}`}
					onClick={() => setActiveImage(null)}
				>
					<button className="lightbox-close-btn" onClick={() => setActiveImage(null)}>
						&times;
					</button>
					<div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
						<img 
							src={activeImage} 
							alt="Expanded Profile View" 
							className="lightbox-img" 
							onClick={() => setIsZoomed(!isZoomed)}
						/>
					</div>
				</div>
			)}
		</div>
	);
};