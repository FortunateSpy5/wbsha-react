import React, { useEffect, useState, useRef } from "react";
import "../../styles/home/media-section.scss";
import SectionTitle from "./SectionTitle";
import { getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../config/firebase";

const MediaSection = () => {
	const [mediaItems, setMediaItems] = useState([]);
	const [inView, setInView] = useState(false);
	const sectionRef = useRef(null);

	useEffect(() => {
		const cached = sessionStorage.getItem("home_media");
		if (cached) {
			try {
				setMediaItems(JSON.parse(cached));
				return;
			} catch (e) {
				sessionStorage.removeItem("home_media");
			}
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "300px" }
		);

		if (sectionRef.current) {
			observer.observe(sectionRef.current);
		}

		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!inView || mediaItems.length > 0) return;

		const mediaRef = collection(db, "media");
		const fetchMedia = async () => {
			try {
				let data;
				try {
					const q = query(mediaRef, orderBy("createdAt", "desc"), limit(6));
					data = await getDocs(q);
				} catch (queryErr) {
					const fallbackQ = query(mediaRef, limit(12));
					data = await getDocs(fallbackQ);
				}
				const sortedData = data.docs
					.map((doc) => {
						const docData = doc.data();
						return {
							...docData,
							id: doc.id,
							createdAt: docData.createdAt?.toDate?.() || new Date(docData.createdAt)
						};
					})
					.sort((a, b) => b.createdAt - a.createdAt)
					.slice(0, 6);
				setMediaItems(sortedData);
				sessionStorage.setItem("home_media", JSON.stringify(sortedData));
			} catch (error) {
				console.error("Error fetching media for home page:", error);
			}
		};
		fetchMedia();
	}, [inView, mediaItems.length]);

	const renderImages = () => {
		const num = ["one", "two", "three", "four", "five", "six"];
		return mediaItems.map((item, index) => {
			if (index >= 6) return null;
			return (
				<img
					className={`${num[index]} image`}
					src={item.imageUrl}
					alt={item.title || "gallery"}
					style={{ gridArea: num[index] }}
					key={item.id || index}
					loading="lazy"
					decoding="async"
				/>
			);
		});
	};

	return (
		<div className="media-section" ref={sectionRef}>
			<SectionTitle title="Media" text="All Media" link="/media" />
			{mediaItems.length === 0 ? (
				<div style={{ textAlign: "center", padding: "2rem" }}>
					No media items available.
				</div>
			) : (
				<div className="gallery">{renderImages()}</div>
			)}
		</div>
	);
};

export default MediaSection;
