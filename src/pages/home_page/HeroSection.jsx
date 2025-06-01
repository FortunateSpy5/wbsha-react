import React, { useEffect, useState } from "react";
import "../../styles/home/hero-section.scss";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

const HeroSection = () => {
	const [current, setCurrent] = useState(0);
	const [carousel, setCarousel] = useState([]);

	const heroRef = collection(db, "heroes");

	useEffect(() => {
		const getHero = async () => {
			const data = await getDocs(heroRef);
			const sortedData = data.docs
				.map((doc) => doc.data())
				.sort((a, b) => {
					return a.order - b.order;
				});
			setCarousel(sortedData);
		};
		getHero();
	}, []);

	const leftArrowClick = () => {
		setCurrent((current - 1 + carousel.length) % carousel.length);
	};

	const rightArrowClick = () => {
		setCurrent((current + 1) % carousel.length);
	};

	const renderIndicators = () => {
		return carousel.map((item, index) => {
			return (
				<div
					key={index}
					className={`indicator ${index === current ? "active" : ""}`}
					onClick={() => {
						setCurrent(index);
					}}
				>
					<div />
				</div>
			);
		});
	};

	const renderInner = () => {
		return carousel.map((item, index) => {
			return (
				<div
					className={`item ${index === current ? "" : "hidden"}`}
					key={index}
				>
					<img src={item.url} alt="..." />
					<div className="caption">
						<div className="title">{item.title}</div>
						<div className="description">{item.description}</div>
					</div>
				</div>
			);
		});
	};

	return (
		<div className="hero-section">
			<div className="carousel">
				{renderInner()}
				<div className="indicators">{renderIndicators()}</div>
			</div>
			<div className="left no-select" onClick={leftArrowClick}>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
				>
					<path d="M16.67 0l2.83 2.829-9.339 9.175 9.339 9.167-2.83 2.829-12.17-11.996z" />
				</svg>
			</div>
			<div className="right no-select" onClick={rightArrowClick}>
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

export default HeroSection;
