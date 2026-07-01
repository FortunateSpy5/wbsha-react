import React from "react";
import AboutSection from "./home_page/AboutSection";
import NewsSection from "./home_page/NewsSection";
import AnnouncementsSection from "./home_page/AnnouncementsSection";
import CompetitionsSection from "./home_page/CompetitionsSection";
import DocumentsSection from "./home_page/DocumentsSection";
import MediaSection from "./home_page/MediaSection";
import ContactSection from "./home_page/ContactSection";
import HeroSection from "./home_page/HeroSection";

const HomePage = () => {
	return (
		<div className="main-content">
			<HeroSection />
			<AboutSection />
			<NewsSection />
			<AnnouncementsSection />
			<CompetitionsSection />
			<DocumentsSection />
			<MediaSection />
			<ContactSection />
		</div>
	);
};

export default HomePage;
