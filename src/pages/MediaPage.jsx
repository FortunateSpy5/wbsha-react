import React, { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import "../styles/media/media-page.scss";

export const MediaPage = () => {
	const [mediaItems, setMediaItems] = useState([]);
	const [albums, setAlbums] = useState([]);
	const [selectedAlbum, setSelectedAlbum] = useState("All");
	const [lightboxIndex, setLightboxIndex] = useState(null); // Index in the filtered list

	useEffect(() => {
		const cached = sessionStorage.getItem("media_data");
		if (cached) {
			const parsed = JSON.parse(cached);
			setMediaItems(parsed);
			const uniqueAlbums = ["All", ...new Set(parsed.map((item) => item.album))];
			setAlbums(uniqueAlbums);
		} else {
			const fetchMedia = async () => {
				try {
					const data = await getDocs(collection(db, "media"));
					const mappedData = data.docs.map((doc) => {
						const docData = doc.data();
						return {
							...docData,
							id: doc.id,
							createdAt: docData.createdAt?.toDate?.() || new Date(docData.createdAt)
						};
					});
					// Sort by createdAt descending
					const sortedData = mappedData.sort((a, b) => b.createdAt - a.createdAt);
					setMediaItems(sortedData);
					sessionStorage.setItem("media_data", JSON.stringify(sortedData));

					const uniqueAlbums = ["All", ...new Set(sortedData.map((item) => item.album))];
					setAlbums(uniqueAlbums);
				} catch (error) {
					console.error("Error fetching media items:", error);
				}
			};
			fetchMedia();
		}
	}, []);

	const filteredMedia = selectedAlbum === "All"
		? mediaItems
		: mediaItems.filter((item) => item.album === selectedAlbum);

	const handlePrev = (e) => {
		e.stopPropagation();
		setLightboxIndex((prevIndex) => (prevIndex === 0 ? filteredMedia.length - 1 : prevIndex - 1));
	};

	const handleNext = (e) => {
		e.stopPropagation();
		setLightboxIndex((prevIndex) => (prevIndex === filteredMedia.length - 1 ? 0 : prevIndex + 1));
	};

	const closeLightbox = () => {
		setLightboxIndex(null);
	};

	return (
		<div className="main-content media-page">
			<div className="content container">
				<div className="page-title">Media Gallery</div>
				{mediaItems.length === 0 ? (
					<div className="loading">Loading gallery...</div>
				) : (
					<>
						<div className="album-filters">
							{albums.map((album) => (
								<button
									key={album}
									className={`filter-btn ${selectedAlbum === album ? "active" : ""}`}
									onClick={() => {
										setSelectedAlbum(album);
										setLightboxIndex(null);
									}}
								>
									{album}
								</button>
							))}
						</div>

						<div className="media-grid">
							{filteredMedia.map((item, index) => (
								<div
									key={item.id || index}
									className="media-card"
									onClick={() => setLightboxIndex(index)}
								>
									<img src={item.imageUrl} alt={item.title} />
									<div className="overlay">
										<div className="image-title">{item.title}</div>
										<div className="image-album">{item.album}</div>
									</div>
								</div>
							))}
						</div>

						{lightboxIndex !== null && (
							<div className="lightbox-modal" onClick={closeLightbox}>
								<button className="lightbox-close" onClick={closeLightbox}>
									&times;
								</button>
								<button className="lightbox-nav prev" onClick={handlePrev}>
									&#10094;
								</button>
								<div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
									<img
										src={filteredMedia[lightboxIndex].imageUrl}
										alt={filteredMedia[lightboxIndex].title}
									/>
									<div className="lightbox-caption">
										<h3>{filteredMedia[lightboxIndex].title}</h3>
										<p>{filteredMedia[lightboxIndex].album}</p>
									</div>
								</div>
								<button className="lightbox-nav next" onClick={handleNext}>
									&#10095;
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};
