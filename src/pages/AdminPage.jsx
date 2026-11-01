import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { getCountFromServer, collection } from "firebase/firestore";
import { CompetitionsAdmin } from "./admin_page/CompetitionsAdmin";
import { HeroAdmin } from "./admin_page/HeroAdmin";
import { NewsAdmin } from "./admin_page/NewsAdmin";
import { MediaAdmin } from "./admin_page/MediaAdmin";
import { AnnouncementsAdmin } from "./admin_page/AnnouncementsAdmin";
import { DocumentsAdmin } from "./admin_page/DocumentsAdmin";
import { EducationAdmin } from "./admin_page/EducationAdmin";
import { ContactSubmissionsAdmin } from "./admin_page/ContactSubmissionsAdmin";
import { AboutAdmin } from "./admin_page/AboutAdmin";
import { optimizeExistingStorageFiles } from "../utils/storageOptimizer";
import "../styles/admin/admin-page.scss";

export const AdminPage = () => {
	const navigate = useNavigate();
	const [user] = useAuthState(auth);
	const [activeTab, setActiveTab] = useState("overview");
	const [optimizing, setOptimizing] = useState(false);
	const [optimizeStatus, setOptimizeStatus] = useState(null);

	const handleOptimizeStorage = async () => {
		setOptimizing(true);
		setOptimizeStatus("Scanning and updating file caching headers in Firebase Storage...");
		try {
			const updatedCount = await optimizeExistingStorageFiles((count, fileName) => {
				setOptimizeStatus(`Updating caching headers... updated ${count} files (latest: ${fileName})`);
			});
			setOptimizeStatus(`✅ Complete! Successfully checked and applied 1-year browser caching (updated ${updatedCount} files).`);
		} catch (err) {
			console.error("Storage optimization error:", err);
			setOptimizeStatus("⚠️ Error optimizing storage files. Check browser console.");
		}
		setOptimizing(false);
	};

	// Overview counts
	const [stats, setStats] = useState({
		heroes: 0,
		competitions: 0,
		news: 0,
		media: 0,
		announcements: 0,
		documents: 0,
		education: 0,
		contactSubmissions: 0,
		aboutSections: 0,
	});
	const [loadingStats, setLoadingStats] = useState(false);

	useEffect(() => {
		if (!user) {
			navigate("/login");
		} else {
			// Fetch stats count
			const fetchStats = async () => {
				setLoadingStats(true);
				try {
					const [heroesSnap, compsSnap, newsSnap, mediaSnap, annSnap, docsSnap, eduSnap, submissionsSnap, aboutSnap] = await Promise.all([
						getCountFromServer(collection(db, "heroes")),
						getCountFromServer(collection(db, "competitions")),
						getCountFromServer(collection(db, "news")),
						getCountFromServer(collection(db, "media")),
						getCountFromServer(collection(db, "announcements")),
						getCountFromServer(collection(db, "documents")),
						getCountFromServer(collection(db, "education")),
						getCountFromServer(collection(db, "contactSubmissions")),
						getCountFromServer(collection(db, "aboutSections")),
					]);
					setStats({
						heroes: heroesSnap.data().count,
						competitions: compsSnap.data().count,
						news: newsSnap.data().count,
						media: mediaSnap.data().count,
						announcements: annSnap.data().count,
						documents: docsSnap.data().count,
						education: eduSnap.data().count,
						contactSubmissions: submissionsSnap.data().count,
						aboutSections: aboutSnap.data().count,
					});
				} catch (error) {
					console.error("Error loading dashboard stats:", error);
				}
				setLoadingStats(false);
			};
			fetchStats();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user]);

	if (!user) {
		return null;
	}

	const renderActiveWorkspace = () => {
		switch (activeTab) {
			case "heroes":
				return <HeroAdmin />;
			case "competitions":
				return <CompetitionsAdmin />;
			case "news":
				return <NewsAdmin />;
			case "gallery":
				return <MediaAdmin />;
			case "announcements":
				return <AnnouncementsAdmin />;
			case "documents":
				return <DocumentsAdmin />;
			case "education":
				return <EducationAdmin />;
			case "submissions":
				return <ContactSubmissionsAdmin />;
			case "about":
				return <AboutAdmin />;
			case "overview":
			default:
				return renderOverview();
		}
	};

	const renderOverview = () => {
		return (
			<div className="admin-overview">
				<h2 className="workspace-heading">Dashboard Overview</h2>
				<p className="overview-intro">
					Welcome back, <strong>{user.displayName || "Administrator"}</strong>. Here is a summary of the website content currently stored in the system. Use the sidebar menu to manage individual sections.
				</p>
				{loadingStats ? (
					<p>Loading stats...</p>
				) : (
					<div className="stats-grid">
						<div className="stat-card" onClick={() => setActiveTab("heroes")}>
							<div className="stat-title">Heroes Carousel</div>
							<div className="stat-count">{stats.heroes}</div>
							<div className="stat-action">Manage &rarr;</div>
						</div>
						<div className="stat-card" onClick={() => setActiveTab("about")}>
							<div className="stat-title">About Sections</div>
							<div className="stat-count">{stats.aboutSections}</div>
							<div className="stat-action">Manage &rarr;</div>
						</div>
						<div className="stat-card" onClick={() => setActiveTab("news")}>
							<div className="stat-title">News Articles</div>
							<div className="stat-count">{stats.news}</div>
							<div className="stat-action">Manage &rarr;</div>
						</div>
						<div className="stat-card" onClick={() => setActiveTab("announcements")}>
							<div className="stat-title">Announcements</div>
							<div className="stat-count">{stats.announcements}</div>
							<div className="stat-action">Manage &rarr;</div>
						</div>
						<div className="stat-card" onClick={() => setActiveTab("competitions")}>
							<div className="stat-title">Competitions</div>
							<div className="stat-count">{stats.competitions}</div>
							<div className="stat-action">Manage &rarr;</div>
						</div>
						<div className="stat-card" onClick={() => setActiveTab("documents")}>
							<div className="stat-title">Official Documents</div>
							<div className="stat-count">{stats.documents}</div>
							<div className="stat-action">Manage &rarr;</div>
						</div>
						<div className="stat-card" onClick={() => setActiveTab("education")}>
							<div className="stat-title">Education Content</div>
							<div className="stat-count">{stats.education}</div>
							<div className="stat-action">Manage &rarr;</div>
						</div>
						<div className="stat-card" onClick={() => setActiveTab("gallery")}>
							<div className="stat-title">Gallery Images</div>
							<div className="stat-count">{stats.media}</div>
							<div className="stat-action">Manage &rarr;</div>
						</div>
						<div className="stat-card" onClick={() => setActiveTab("submissions")}>
							<div className="stat-title">Form Submissions</div>
							<div className="stat-count">{stats.contactSubmissions}</div>
							<div className="stat-action">Manage &rarr;</div>
						</div>
					</div>
				)}

				<div className="storage-optimization-panel" style={{
					marginTop: "2.5rem",
					padding: "1.5rem",
					background: "#f0f9ff",
					border: "1px solid #bae6fd",
					borderRadius: "8px",
					color: "#0369a1"
				}}>
					<h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
						⚡ Bandwidth & Storage Cache Optimizer
					</h3>
					<p style={{ margin: "0 0 1rem 0", fontSize: "0.9rem", color: "#334155" }}>
						Retroactively applies 1-year browser and CDN caching (<code>Cache-Control: public, max-age=31536000, immutable</code>) to all 104 existing images and files in Firebase Storage to eliminate repetitive bandwidth spikes.
					</p>
					<button
						onClick={handleOptimizeStorage}
						disabled={optimizing}
						className="button"
						style={{ padding: "0.6rem 1.25rem", cursor: optimizing ? "not-allowed" : "pointer" }}
					>
						{optimizing ? "Optimizing Storage Files..." : "Run Cache Optimizer on All Existing Files"}
					</button>
					{optimizeStatus && (
						<div style={{ marginTop: "1rem", fontSize: "0.9rem", fontWeight: "600", color: optimizeStatus.includes("✅") ? "#15803d" : "#0284c7" }}>
							{optimizeStatus}
						</div>
					)}
				</div>
			</div>
		);
	};

	return (
		<div className="main-content admin-dashboard-page">
			<div className="admin-layout">
				<aside className="admin-sidebar">
					<div className="admin-brand">WBSHA Admin</div>
					<nav className="sidebar-nav">
						<button 
							className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
							onClick={() => setActiveTab("overview")}
						>
							📊 Overview
						</button>
						<button 
							className={`nav-item ${activeTab === "heroes" ? "active" : ""}`}
							onClick={() => setActiveTab("heroes")}
						>
							🖼️ Manage Heroes
						</button>
						<button 
							className={`nav-item ${activeTab === "about" ? "active" : ""}`}
							onClick={() => setActiveTab("about")}
						>
							ℹ️ Manage About Page
						</button>
						<button 
							className={`nav-item ${activeTab === "news" ? "active" : ""}`}
							onClick={() => setActiveTab("news")}
						>
							📰 Manage News
						</button>
						<button 
							className={`nav-item ${activeTab === "announcements" ? "active" : ""}`}
							onClick={() => setActiveTab("announcements")}
						>
							📢 Announcements
						</button>
						<button 
							className={`nav-item ${activeTab === "competitions" ? "active" : ""}`}
							onClick={() => setActiveTab("competitions")}
						>
							🏆 Manage Competitions
						</button>
						<button 
							className={`nav-item ${activeTab === "documents" ? "active" : ""}`}
							onClick={() => setActiveTab("documents")}
						>
							📄 Manage Documents
						</button>
						<button 
							className={`nav-item ${activeTab === "education" ? "active" : ""}`}
							onClick={() => setActiveTab("education")}
						>
							📚 Manage Education
						</button>
						<button 
							className={`nav-item ${activeTab === "gallery" ? "active" : ""}`}
							onClick={() => setActiveTab("gallery")}
						>
							📷 Manage Gallery
						</button>
						<button 
							className={`nav-item ${activeTab === "submissions" ? "active" : ""}`}
							onClick={() => setActiveTab("submissions")}
						>
							📩 Contact Submissions
						</button>
					</nav>
					<button className="sidebar-logout" onClick={() => auth.signOut()}>
						🚪 Sign out
					</button>
				</aside>
				
				<main className="admin-workspace">
					<div className="workspace-container">
						{renderActiveWorkspace()}
					</div>
				</main>
			</div>
		</div>
	);
};
