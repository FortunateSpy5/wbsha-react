import React, { useEffect, useState } from "react";
import "../../styles/home/media-section.scss";
import SectionTitle from "./SectionTitle";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

const MediaSection = () => {
	const [mediaItems, setMediaItems] = useState([]);

	useEffect(() => {
		const mediaRef = collection(db, "media");
		const cachedMedia = sessionStorage.getItem("home_media");
		if (cachedMedia) {
			setMediaItems(JSON.parse(cachedMedia));
		} else {
			const fetchMedia = async () => {
				try {
					const data = await getDocs(mediaRef);
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
						.slice(0, 6); // Latest 6 images
					setMediaItems(sortedData);
					sessionStorage.setItem("home_media", JSON.stringify(sortedData));
				} catch (error) {
					console.error("Error fetching media for home page:", error);
				}
			};
			fetchMedia();
		}
	}, []);

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
				/>
			);
		});
	};

	return (
		<div className="media-section">
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
