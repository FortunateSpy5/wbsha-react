import React, { useRef } from "react";
import "../../styles/home/news-section.scss";
import { Link } from "react-router-dom";
import SectionTitle from "./SectionTitle";

const newsData = [
	{
		image: "https://picsum.photos/300/600?random=1",
		title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
		link: "/news",
	},
	{
		image: "https://picsum.photos/300/600?random=2",
		title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
		link: "/news",
	},
	{
		image: "https://picsum.photos/300/600?random=3",
		title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
		link: "/news",
	},
	{
		image: "https://picsum.photos/300/600?random=4",
		title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
		link: "/news",
	},
	{
		image: "https://picsum.photos/300/600?random=5",
		title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
		link: "/news",
	},
	{
		image: "https://picsum.photos/300/600?random=6",
		title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
		link: "/news",
	},
	{
		image: "https://picsum.photos/300/400?random=7",
		title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
		link: "/news",
	},
	{
		image: "https://picsum.photos/300/600?random=8",
		title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.",
		link: "/news",
	},
];

const NewsSection = () => {
	return (
		<div className="news-section">
			<SectionTitle title="News" text="All News" link="/news" />
			<News />
		</div>
	);
};

const News = () => {
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
				{newsCollection(cardRef)}
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

const newsCollection = (cardRef) => {
	return newsData.map((data, index) => {
		return (
			<div
				className="news-card"
				key={index}
				ref={index === 0 ? cardRef : null}
			>
				<Link to={data.link}>
					<div
						className="image"
						style={{
							backgroundImage: `url(${data.image})`,
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
