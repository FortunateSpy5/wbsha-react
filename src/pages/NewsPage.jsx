import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/news/news-page.scss";

export const NewsPage = () => {
	const [news, setNews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [expandedNewsId, setExpandedNewsId] = useState(null);
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

	// Pagination logic
	const indexOfLastItem = currentPage * itemsPerPage;
	const indexOfFirstItem = indexOfLastItem - itemsPerPage;
	const currentNews = news.slice(indexOfFirstItem, indexOfLastItem);
	const totalPages = Math.ceil(news.length / itemsPerPage);

	const toggleExpand = (id) => {
		setExpandedNewsId(expandedNewsId === id ? null : id);
	};

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
						<div className="news-grid">
							{currentNews.map((item) => (
								<div key={item.id} className={`news-card ${expandedNewsId === item.id ? 'expanded' : ''}`}>
									<div className="news-image" style={{ backgroundImage: `url("${item.imageUrl}")` }} />
									<div className="news-body">
										<div className="news-date">{new Date(item.date).toLocaleDateString()}</div>
										<h3 className="news-card-title">{item.title}</h3>
										<p className="news-excerpt">
											{expandedNewsId === item.id 
												? item.content 
												: `${item.content.substring(0, 150)}${item.content.length > 150 ? '...' : ''}`
											}
										</p>
										<button className="read-more-btn" onClick={() => toggleExpand(item.id)}>
											{expandedNewsId === item.id ? "Read Less" : "Read More"}
										</button>
									</div>
								</div>
							))}
						</div>
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
		</div>
	);
};
