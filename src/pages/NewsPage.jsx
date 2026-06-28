import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/news/news-page.scss";

export const NewsPage = () => {
	const [news, setNews] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [expandedNewsId, setExpandedNewsId] = useState(null);
	const itemsPerPage = 9;

	useEffect(() => {
		const cached = sessionStorage.getItem("news_data");
		if (cached) {
			const parsed = JSON.parse(cached).map(item => ({
				...item,
				date: new Date(item.date)
			}));
			setNews(parsed);
		} else {
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
					sessionStorage.setItem("news_data", JSON.stringify(sortedData));
				} catch (error) {
					console.error("Error fetching news:", error);
				}
			};
			fetchNews();
		}
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
				{news.length === 0 ? (
					<div className="loading">Loading news...</div>
				) : (
					<>
						<div className="news-grid">
							{currentNews.map((item) => (
								<div key={item.id} className={`news-card ${expandedNewsId === item.id ? 'expanded' : ''}`}>
									<div className="news-image" style={{ backgroundImage: `url(${item.imageUrl})` }} />
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
