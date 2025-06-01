import React from "react";
import HomePage from "./pages/HomePage";
import Navbar from "./pages/general/Navbar";
import Footer from "./pages/general/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import "./styles/app.scss";
import { AdminPage } from "./pages/AdminPage";
import { AboutPage } from "./pages/AboutPage";

const App = () => {
	return (
		<div className="main-container">
			<BrowserRouter>
				<Navbar />
				<Routes>
					<Route path="/" element={<HomePage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/about" element={<AboutPage />} />
					<Route path="/admin" element={<AdminPage />} />
					<Route path="*" element={<HomePage />} />
				</Routes>
				<Footer />
			</BrowserRouter>
		</div>
	);
};

export default App;
