import React, { useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDocs, collection } from "firebase/firestore";
import { CompetitionsAdmin } from "./admin_page/CompetitionsAdmin";
import { HeroAdmin } from "./admin_page/HeroAdmin";
import { NewsAdmin } from "./admin_page/NewsAdmin";
import { MediaAdmin } from "./admin_page/MediaAdmin";
import { AnnouncementsAdmin } from "./admin_page/AnnouncementsAdmin";
import { DocumentsAdmin } from "./admin_page/DocumentsAdmin";
import { ContactSubmissionsAdmin } from "./admin_page/ContactSubmissionsAdmin";
import { AboutAdmin } from "./admin_page/AboutAdmin";
import "../styles/admin/admin-page.scss";

export const AdminPage = () => {
	const navigate = useNavigate();
	const [user] = useAuthState(auth);
	const [activeTab, setActiveTab] = useState("overview");

	// Overview counts
	const [stats, setStats] = useState({
		heroes: 0,
		competitions: 0,
		news: 0,
		media: 0,
		announcements: 0,
		documents: 0,
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
					const [heroesSnap, compsSnap, newsSnap, mediaSnap, annSnap, docsSnap, submissionsSnap, aboutSnap] = await Promise.all([
						getDocs(collection(db, "heroes")),
						getDocs(collection(db, "competitions")),
						getDocs(collection(db, "news")),
						getDocs(collection(db, "media")),
						getDocs(collection(db, "announcements")),
						getDocs(collection(db, "documents")),
						getDocs(collection(db, "contactSubmissions")),
						getDocs(collection(db, "aboutSections")),
					]);
					setStats({
						heroes: heroesSnap.size,
						competitions: compsSnap.size,
						news: newsSnap.size,
						media: mediaSnap.size,
						announcements: annSnap.size,
						documents: docsSnap.size,
						contactSubmissions: submissionsSnap.size,
						aboutSections: aboutSnap.size,
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
