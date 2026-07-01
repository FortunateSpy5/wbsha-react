import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/competitions/competition-detail.scss";

export const CompetitionDetailPage = () => {
	const { id } = useParams();
	const [competition, setCompetition] = useState(null);
	const [loading, setLoading] = useState(true);
	
	// Active sub-tab state: "about", "teams", "gallery"
	const [activeTab, setActiveTab] = useState("about");

	// Collapsible expanded team details map: { teamId: boolean }
	const [expandedTeams, setExpandedTeams] = useState({});

	// Lightbox state
	const [lightboxImages, setLightboxImages] = useState([]); // Flat array of images currently in view
	const [lightboxIndex, setLightboxIndex] = useState(null); // Index in the lightboxImages array
	const [lightboxGroupTitle, setLightboxGroupTitle] = useState("");

	useEffect(() => {
		const fetchDetail = async () => {
			setLoading(true);
			try {
				const docRef = doc(db, "competitions", id);
				const docSnap = await getDoc(docRef);
				if (docSnap.exists()) {
					const data = docSnap.data();
					setCompetition({
						...data,
						id: docSnap.id,
						startDate: data.startDate?.toDate() || new Date(data.startDate),
						endDate: data.endDate?.toDate() || (data.endDate ? new Date(data.endDate) : null),
					});
				} else {
					console.error("No such competition!");
				}
			} catch (error) {
				console.error("Error fetching competition detail:", error);
			}
			setLoading(false);
		};
		fetchDetail();
	}, [id]);

	if (loading) {
		return (
			<div className="main-content competition-detail-page">
				<div className="content container loading">Loading details...</div>
			</div>
		);
	}

	if (!competition) {
		return (
			<div className="main-content competition-detail-page">
				<div className="content container error">
					<h2>Competition Not Found</h2>
					<Link to="/competitions" className="button">Back to Competitions</Link>
				</div>
			</div>
		);
	}

	// Collapsible toggle helper
	const toggleTeamRoster = (teamId) => {
		setExpandedTeams((prev) => ({
			...prev,
			[teamId]: !prev[teamId]
		}));
	};

	// Lightbox navigation helpers
	const openLightbox = (imagesList, startIndex, groupName = "") => {
		setLightboxImages(imagesList);
		setLightboxIndex(startIndex);
		setLightboxGroupTitle(groupName);
	};

	const handlePrev = (e) => {
		e.stopPropagation();
		setLightboxIndex((prevIndex) => (prevIndex === 0 ? lightboxImages.length - 1 : prevIndex - 1));
	};

	const handleNext = (e) => {
		e.stopPropagation();
		setLightboxIndex((prevIndex) => (prevIndex === lightboxImages.length - 1 ? 0 : prevIndex + 1));
	};

	const closeLightbox = () => {
		setLightboxIndex(null);
		setLightboxImages([]);
		setLightboxGroupTitle("");
	};

	// Format rank display
	const formatRank = (rank) => {
		if (!rank) return "";
		if (rank === 1) return "🥇 1st";
		if (rank === 2) return "🥈 2nd";
		if (rank === 3) return "🥉 3rd";
		return `${rank}th`;
	};

	return (
		<div className="main-content competition-detail-page">
			<div className="content container">
				<div className="back-link">
					<Link to="/competitions">
						&larr; Back to Competitions
					</Link>
				</div>

				<div className="page-title">{competition.title}</div>

				{competition.mainImageUrl && (
					<div className="competition-main-banner" style={{ width: "100%", height: "300px", borderRadius: "8px", overflow: "hidden", marginBottom: "2rem", border: "1px solid #e2e8f0" }}>
						<img src={competition.mainImageUrl} alt={`${competition.title} Banner`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
					</div>
				)}

				<div className="competition-meta-details">
					<div className="meta-item">
						<strong>Dates: </strong>
						<span>
							{competition.startDate?.toLocaleDateString()}
							{competition.endDate && ` - ${competition.endDate?.toLocaleDateString()}`}
						</span>
					</div>
					{competition.venue && (
						<div className="meta-item">
							<strong>Venue: </strong>
							<span>{competition.venue}</span>
						</div>
					)}
				</div>

				{/* Detail Page Tabs Navigation */}
				<div className="competition-tabs-menu">
					<button
						className={`tab-menu-btn ${activeTab === "about" ? "active" : ""}`}
						onClick={() => setActiveTab("about")}
					>
						ℹ️ About
					</button>
					{competition.teams && competition.teams.length > 0 && (
						<button
							className={`tab-menu-btn ${activeTab === "teams" ? "active" : ""}`}
							onClick={() => setActiveTab("teams")}
						>
							👥 Teams & Standings
						</button>
					)}
					{competition.picGroups && competition.picGroups.length > 0 && (
						<button
							className={`tab-menu-btn ${activeTab === "gallery" ? "active" : ""}`}
							onClick={() => setActiveTab("gallery")}
						>
							📷 Tournament Gallery
						</button>
					)}
				</div>

				{/* Tab content area */}
				<div className="competition-tab-content">
					{/* Tab 1: About */}
					{activeTab === "about" && (
						<div className="about-tab-view">
							<div
								className="competition-description text"
								dangerouslySetInnerHTML={{ __html: competition.content }}
							/>
							{competition.results && (
								<div className="competition-results-section">
									<div className="page-heading">Results & Standings Summary</div>
									<div className="results-text text">{competition.results}</div>
								</div>
							)}
						</div>
					)}

					{/* Tab 2: Teams & Standings */}
					{activeTab === "teams" && competition.teams && (
						<div className="teams-tab-view">
							<div className="page-heading">Participating Teams & Leaderboard</div>
							<div className="teams-listing-grid">
								{competition.teams
									.sort((a, b) => (a.rank || 99) - (b.rank || 99))
									.map((team) => (
										<div key={team.id} className="public-team-card">
											<div className="team-card-header">
												<div className="team-name-rank">
													{team.rank ? (
														<span className="team-rank-badge">{formatRank(team.rank)}</span>
													) : null}
													<h3 className="team-name-title">{team.name}</h3>
												</div>
												{team.standing && (
													<span className="team-standing-badge">{team.standing}</span>
												)}
											</div>

											{team.groupPhotoUrl && (
												<div className="team-group-photo-box">
													<img src={team.groupPhotoUrl} alt={`${team.name} Squad`} />
												</div>
											)}

											{team.additionalInfo && (
												<div className="team-roster-collapse">
													<button 
														className="roster-toggle-btn"
														onClick={() => toggleTeamRoster(team.id)}
													>
														{expandedTeams[team.id] ? "▼ Hide Team Roster" : "▶ Show Team Roster"}
													</button>
													{expandedTeams[team.id] && (
														<div className="roster-expanded-content">
															<pre>{team.additionalInfo}</pre>
														</div>
													)}
												</div>
											)}

											{team.pics && team.pics.length > 0 && (
												<div className="team-action-gallery-section">
													<div className="team-gallery-title">Team Action Shots</div>
													<div className="team-public-pics-grid">
														{team.pics.map((pic, idx) => (
															<div 
																key={idx} 
																className="team-pic-card"
																onClick={() => openLightbox(team.pics, idx, `${team.name} Action`)}
															>
																<img src={pic.url} alt={pic.title} />
																<div className="img-overlay">
																	<span className="img-caption">{pic.title}</span>
																</div>
															</div>
														))}
													</div>
												</div>
											)}
										</div>
									))}
							</div>
						</div>
					)}

					{/* Tab 3: Gallery */}
					{activeTab === "gallery" && competition.picGroups && (
						<div className="gallery-tab-view">
							<div className="page-heading">Media & Photo Albums</div>
							{competition.picGroups.map((group, groupIdx) => (
								<div key={groupIdx} className="pic-group-section">
									<h3 className="group-title">{group.title}</h3>
									{(!group.pics || group.pics.length === 0) ? (
										<p className="no-pics">No images in this album yet.</p>
									) : (
										<div className="pic-grid">
											{group.pics.map((pic, picIdx) => (
												<div
													key={picIdx}
													className="pic-card"
													onClick={() => openLightbox(group.pics, picIdx, group.title)}
												>
													<img src={pic.url} alt={pic.title} />
													<div className="pic-overlay">
														<span className="pic-title">{pic.title}</span>
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

				{/* Shared Lightbox Overlay */}
				{lightboxIndex !== null && lightboxImages.length > 0 && (
					<div className="lightbox-modal" onClick={closeLightbox}>
						<button className="lightbox-close" onClick={closeLightbox}>
							&times;
						</button>
						<button className="lightbox-nav prev" onClick={handlePrev}>
							&#10094;
						</button>
						<div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
							<img
								src={lightboxImages[lightboxIndex].url}
								alt={lightboxImages[lightboxIndex].title}
							/>
							<div className="lightbox-caption">
								<h3>{lightboxImages[lightboxIndex].title}</h3>
								{lightboxGroupTitle && <p>{lightboxGroupTitle}</p>}
							</div>
						</div>
						<button className="lightbox-nav next" onClick={handleNext}>
							&#10095;
						</button>
					</div>
				)}
			</div>
		</div>
	);
};
