import React from "react";
import AboutSection from "./home_page/AboutSection";
import ContactSection from "./home_page/ContactSection";
import HeroSection from "./home_page/HeroSection";
import MediaSection from "./home_page/MediaSection";
import NewsSection from "./home_page/NewsSection";

const HomePage = () => {
	return (
		<div className="main-content">
			<HeroSection />
			<AboutSection />
			<NewsSection />
			<MediaSection />
			<ContactSection />
		</div>
	);
};

export default HomePage;
