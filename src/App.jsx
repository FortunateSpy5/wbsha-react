import React, { Suspense, lazy } from "react";
import Navbar from "./pages/general/Navbar";
import Footer from "./pages/general/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/app.scss";

// Lazy loaded page components
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage").then(module => ({ default: module.LoginPage })));
const AdminPage = lazy(() => import("./pages/AdminPage").then(module => ({ default: module.AdminPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then(module => ({ default: module.AboutPage })));
const NewsPage = lazy(() => import("./pages/NewsPage").then(module => ({ default: module.NewsPage })));
const MediaPage = lazy(() => import("./pages/MediaPage").then(module => ({ default: module.MediaPage })));
const AnnouncementsPage = lazy(() => import("./pages/AnnouncementsPage").then(module => ({ default: module.AnnouncementsPage })));
const DocumentsPage = lazy(() => import("./pages/DocumentsPage").then(module => ({ default: module.DocumentsPage })));
const CompetitionsPage = lazy(() => import("./pages/CompetitionsPage").then(module => ({ default: module.CompetitionsPage })));
const CompetitionDetailPage = lazy(() => import("./pages/CompetitionDetailPage").then(module => ({ default: module.CompetitionDetailPage })));

const PageLoader = () => (
	<div className="page-loader" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
		<div className="spinner" style={{ width: "40px", height: "40px", border: "4px solid rgba(0, 157, 247, 0.1)", borderTop: "4px solid #009df7", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
		<style>{`
			@keyframes spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
		`}</style>
	</div>
);

const App = () => {
	return (
		<div className="main-container">
			<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
				<Navbar />
				<Suspense fallback={<PageLoader />}>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/login" element={<LoginPage />} />
						<Route path="/about" element={<AboutPage />} />
						<Route path="/admin" element={<AdminPage />} />
						<Route path="/news" element={<NewsPage />} />
						<Route path="/media" element={<MediaPage />} />
						<Route path="/announcements" element={<AnnouncementsPage />} />
						<Route path="/documents" element={<DocumentsPage />} />
						<Route path="/competitions" element={<CompetitionsPage />} />
						<Route path="/competitions/:id" element={<CompetitionDetailPage />} />
						<Route path="*" element={<HomePage />} />
					</Routes>
				</Suspense>
				<Footer />
			</BrowserRouter>
		</div>
	);
};

export default App;
