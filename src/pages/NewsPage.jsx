import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import { NewsDetailModal } from "./general/NewsDetailModal";
import "../styles/news/news-page.scss";

export const NewsPage = () => {
	const [news, setNews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedNews, setSelectedNews] = useState(null);
	const [activeCategory, setActiveCategory] = useState("all");
	const [searchTerm, setSearchTerm] = useState("");
	const itemsPerPage = 9;

	useEffect(() => {
		const fetchNews = async () => {
			try {
				const data = await getDocs(collection(db, "news"));
				const mappedData = data.docs.map((doc) => {
					const docData = doc.data();
					return {
						...docData,
						id: doc.id,
						date: docData.date?.toDate?.() || new Date(docData.date)
					};
				});
				const sortedData = mappedData.sort((a, b) => b.date - a.date);
				setNews(sortedData);
			} catch (error) {
				console.error("Error fetching news:", error);
			}
			setLoading(false);
		};
		fetchNews();
	}, []);

	// Handle deep linking to open a news item modal automatically if shared
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const articleId = params.get("id");
		if (articleId && news.length > 0) {
			const matched = news.find((item) => item.id === articleId);
			if (matched) {
				setSelectedNews(matched);
			}
		}
	}, [news]);

	// Highlight the featured story
	const featuredArticle = news.find((item) => item.isFeatured) || news[0];

	// Exclude spotlight article from grid listing on Page 1
	const showSpotlight = featuredArticle && currentPage === 1 && activeCategory === "all" && !searchTerm;
	const otherNews = news.filter((item) => !showSpotlight || item.id !== featuredArticle.id);

	// Client-side category and live search matching
	const filteredNews = otherNews.filter((item) => {
		const matchesCategory = activeCategory === "all" || item.category === activeCategory;
		const matchesSearch = 
			item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
			item.content.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesCategory && matchesSearch;
	});

	// Pagination math
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentNews = filteredNews.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(filteredNews.length / itemsPerPage);

	return (
		<div className="main-content news-page">
			<div className="content container">
				<div className="page-title">News</div>
				
				{loading ? (
					<div className="skeleton-news-grid">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="skeleton-news-card">
								<div className="skeleton-image" />
								<div className="skeleton-body">
									<div className="skeleton-date" />
									<div className="skeleton-title" />
									<div className="skeleton-text" />
									<div className="skeleton-text" />
									<div className="skeleton-btn" />
								</div>
							</div>
						))}
					</div>
				) : news.length === 0 ? (
					<div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
						No news articles found.
					</div>
				) : (
					<>
						{/* Featured Spotlight Card */}
						{showSpotlight && (
							<div className="news-spotlight-card">
								<div className="spotlight-badge">🔥 Featured Story</div>
								<div className="spotlight-layout">
									<div className="spotlight-image" onClick={() => setSelectedNews(featuredArticle)}>
										<img src={featuredArticle.imageUrl} alt={featuredArticle.title} />
									</div>
									<div className="spotlight-body">
										<div className="spotlight-date">
											{new Date(featuredArticle.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
										</div>
										<h2 className="spotlight-title" onClick={() => setSelectedNews(featuredArticle)}>{featuredArticle.title}</h2>
										<p className="spotlight-excerpt">
											{`${featuredArticle.content.substring(0, 240)}${featuredArticle.content.length > 240 ? '...' : ''}`}
										</p>
										<button className="spotlight-btn button" onClick={() => setSelectedNews(featuredArticle)}>
											Read Full Story
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Live Filters & Search Bar */}
						<div className="news-filters-bar">
							<div className="category-pills">
								{[
									{ id: "all", label: "All News" },
									{ id: "general", label: "General" },
									{ id: "tournaments", label: "Tournaments" },
									{ id: "announcements", label: "Announcements" },
									{ id: "selections", label: "Selections" },
									{ id: "achievements", label: "Achievements" }
								].map((pill) => (
									<button
										key={pill.id}
										className={`category-pill ${activeCategory === pill.id ? "active" : ""}`}
										onClick={() => {
											setActiveCategory(pill.id);
											setCurrentPage(1);
										}}
									>
										{pill.label}
									</button>
								))}
							</div>
							<div className="search-box">
								<input
									type="text"
									placeholder="Search articles..."
									value={searchTerm}
									onChange={(e) => {
										setSearchTerm(e.target.value);
										setCurrentPage(1);
									}}
									className="news-search-input"
								/>
							</div>
						</div>

						{/* Grid Items or Blank state */}
						{filteredNews.length === 0 ? (
							<div className="no-matches-found" style={{ textAlign: "center", padding: "4rem 2rem", color: "#64748b", background: "#fff", borderRadius: "8px", border: "1px solid #e2e8f0", marginTop: "2rem" }}>
								<span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>🔍</span>
								No news articles match your filter keywords.
							</div>
						) : (
							<div className="news-grid">
								{currentNews.map((item) => (
									<div key={item.id} className="news-card">
										<div className="news-image" onClick={() => setSelectedNews(item)} style={{ cursor: "pointer" }}>
											<img src={item.imageUrl} alt={item.title} />
										</div>
										<div className="news-body">
											<div className="news-date">{new Date(item.date).toLocaleDateString()}</div>
											<h3 className="news-card-title" onClick={() => setSelectedNews(item)} style={{ cursor: "pointer" }}>{item.title}</h3>
											<p className="news-excerpt">
												{`${item.content.substring(0, 150)}${item.content.length > 150 ? '...' : ''}`}
											</p>
											<button className="read-more-btn" onClick={() => setSelectedNews(item)}>
												Read More
											</button>
										</div>
									</div>
								))}
							</div>
						)}

						{/* Pagination Controls */}
						{totalPages > 1 && (
							<div className="pagination">
								<button 
									className="button btn-prev" 
									onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
								>
									Previous
								</button>
								<span className="page-number">Page {currentPage} of {totalPages}</span>
								<button 
									className="button btn-next" 
									onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
									disabled={currentPage === totalPages}
								>
									Next
								</button>
							</div>
						)}
					</>
				)}
			</div>

			{/* Detailed News Modal Overlay */}
			{selectedNews && (
				<NewsDetailModal newsItem={selectedNews} onClose={() => setSelectedNews(null)} />
			)}
		</div>
	);
};
