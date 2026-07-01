import React from "react";
import HomePage from "./pages/HomePage";
import Navbar from "./pages/general/Navbar";
import Footer from "./pages/general/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import "./styles/app.scss";
import { AdminPage } from "./pages/AdminPage";
import { AboutPage } from "./pages/AboutPage";
import { NewsPage } from "./pages/NewsPage";
import { MediaPage } from "./pages/MediaPage";
import { AnnouncementsPage } from "./pages/AnnouncementsPage";
import { DocumentsPage } from "./pages/DocumentsPage";
import { CompetitionsPage } from "./pages/CompetitionsPage";
import { CompetitionDetailPage } from "./pages/CompetitionDetailPage";

const App = () => {
	return (
		<div className="main-container">
			<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
				<Navbar />
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
				<Footer />
			</BrowserRouter>
		</div>
	);
};

export default App;
