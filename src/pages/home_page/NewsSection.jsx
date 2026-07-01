import React, { useEffect, useState, useRef } from "react";
import "../../styles/home/news-section.scss";
import { Link } from "react-router-dom";
import SectionTitle from "./SectionTitle";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

const NewsSection = () => {
	const [news, setNews] = useState([]);

	useEffect(() => {
		const newsRef = collection(db, "news");
		const fetchNews = async () => {
			try {
				const data = await getDocs(newsRef);
				const sortedData = data.docs
					.map((doc) => ({
						...doc.data(),
						id: doc.id,
						date: doc.data().date?.toDate() || new Date(doc.data().date)
					}))
					.sort((a, b) => b.date - a.date)
					.slice(0, 6); // Latest 6 news items
				setNews(sortedData);
			} catch (error) {
				console.error("Error fetching news for home page:", error);
			}
		};
		fetchNews();
	}, []);

	return (
		<div className="news-section">
			<SectionTitle title="News" text="All News" link="/news" />
			{news.length === 0 ? (
				<div className="container" style={{ textAlign: "center", padding: "2rem" }}>
					No news updates available.
				</div>
			) : (
				<News newsList={news} />
			)}
		</div>
	);
};

const News = ({ newsList }) => {
	const cardCollectionRef = useRef();
	const cardRef = useRef();

	const leftArrowClick = () => {
		const width = cardRef.current.offsetWidth;
		cardCollectionRef.current.scrollLeft =
			Math.round(cardCollectionRef.current.scrollLeft / width - 1) *
			width;
	};

	const rightArrowClick = () => {
		const width = cardRef.current.offsetWidth;
		cardCollectionRef.current.scrollLeft =
			Math.round(cardCollectionRef.current.scrollLeft / width + 1) *
			width;
	};

	return (
		<div className="news">
			<div className="news-card-collection" ref={cardCollectionRef}>
				{newsCollection(newsList, cardRef)}
			</div>
			<div className="news-left no-select" onClick={leftArrowClick}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
				>
					<path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
				</svg>
			</div>
			<div className="news-right no-select" onClick={rightArrowClick}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
				>
					<path d="M7.33 24l-2.83-2.829 9.339-9.175-9.339-9.167 2.83-2.829 12.17 11.996z" />
				</svg>
			</div>
		</div>
	);
};

const newsCollection = (newsList, cardRef) => {
	return newsList.map((data, index) => {
		return (
			<div
				className="news-card"
				key={data.id || index}
				ref={index === 0 ? cardRef : null}
			>
				<Link to="/news">
					<div
						className="image"
						style={{
							backgroundImage: `url("${data.imageUrl}")`,
							filter: "brightness(90%)",
						}}
					/>
				</Link>
				<div className="text">{data.title}</div>
			</div>
		);
	});
};

export default NewsSection;
