import React from "react";
import "../../styles/home/section-title.scss";
import { Link } from "react-router-dom";

const SectionTitle = (props) => {
	return (
		<div className="container section-title">
			<div className="title">{props.title}</div>
			<div className="link">
				<Link to={props.link}>{props.text}</Link>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
				>
					<path d="M6.028 0v6.425l5.549 5.575-5.549 5.575v6.425l11.944-12z" />
				</svg>
			</div>
		</div>
	);
};

export default SectionTitle;
