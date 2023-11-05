import React from "react";
import "../../styles/home/media-section.scss";
import SectionTitle from "./SectionTitle";

const imageData = [
	{
		image: "https://picsum.photos/600/600?random=1",
		title: "Lorem ipsum dolor sit amet",
		link: "/media/gallery",
	},
	{
		image: "https://picsum.photos/300/300?random=2",
		title: "Consectetur adipiscing elit",
		link: "/media/gallery",
	},
	{
		image: "https://picsum.photos/600/300?random=3",
		title: "Sed do eiusmod tempor incididunt",
		link: "/media/gallery",
	},
	{
		image: "https://picsum.photos/600/300?random=4",
		title: "Consectetur adipiscing elit",
		link: "/media/gallery",
	},
	{
		image: "https://picsum.photos/300/300?random=5",
		title: "Sed do eiusmod tempor incididunt",
		link: "/media/gallery",
	},
	{
		image: "https://picsum.photos/300/600?random=6",
		title: "Lorem ipsum dolor sit amet",
		link: "/media/gallery",
	},
];

const MediaSection = () => {
	const renderImages = () => {
		const num = ["one", "two", "three", "four", "five", "six"];
		return imageData.map((item, index) => {
			return (
				<img
					className={`${num[index]} image`}
					src={item.image}
					alt="gallery"
					style={{ gridArea: num[index] }}
					key={index}
				/>
			);
		});
	};

	return (
		<div className="media-section">
			<SectionTitle title="Media" text="All Media" link="/media" />
			<div className="gallery">{renderImages()}</div>
		</div>
	);
};

export default MediaSection;
