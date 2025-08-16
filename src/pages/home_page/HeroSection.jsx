import React, { useEffect, useState } from "react";
import "../../styles/home/hero-section.scss";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

const HeroSection = () => {
    const [current, setCurrent] = useState(0);
    const [carousel, setCarousel] = useState([]);

    const heroRef = collection(db, "heroes");

    useEffect(() => {
        // Check if heroes are already cached in sessionStorage
        const cachedHeroes = sessionStorage.getItem("heroes");
        if (cachedHeroes) {
            setCarousel(JSON.parse(cachedHeroes));
        } else {
            // Fetch heroes from Firebase and cache them
            const getHero = async () => {
                try {
                    const data = await getDocs(heroRef);
                    const sortedData = data.docs
                        .map((doc) => doc.data())
                        .sort((a, b) => a.order - b.order);
                    setCarousel(sortedData);
                    sessionStorage.setItem("heroes", JSON.stringify(sortedData));
                } catch (error) {
                    console.error("Error fetching heroes:", error);
                }
            };
            getHero();
        }
    }, [heroRef]);

    const leftArrowClick = () => {
        setCurrent((current - 1 + carousel.length) % carousel.length);
    };

    const rightArrowClick = () => {
        setCurrent((current + 1) % carousel.length);
    };

    const renderIndicators = () => {
        return carousel.map((item, index) => (
            <div
                key={index}
                className={`indicator ${index === current ? "active" : ""}`}
                onClick={() => setCurrent(index)}
            >
                <div />
            </div>
        ));
    };

    const renderInner = () => {
        return carousel.map((item, index) => (
            <div
                className={`item ${index === current ? "" : "hidden"}`}
                key={index}
        	>
                <img src={item.url} alt={item.title} />
                <div className="caption">
                    <div className="title">{item.title}</div>
                    <div className="description">{item.description}</div>
                </div>
            </div>
        ));
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
