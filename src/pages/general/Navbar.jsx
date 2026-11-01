import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.scss";
import logo from "../../assets/logo.svg";

export const navLinksData = [
	{ name: "Home", link: "/" },
	{ name: "About", link: "/about" },
	{ name: "News", link: "/news" },
	{ name: "Announcements", link: "/announcements" },
	{ name: "Competitions", link: "/competitions" },
	{ name: "Documents", link: "/documents" },
	{ name: "Media", link: "/media" },
	{ name: "Education", link: "/education" },
];

export const socialData = [
	{
		name: "Facebook",
		svg: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 48 48"
				fill="currentColor"
				shapeRendering="geometricPrecision"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M24 0C10.745 0 0 10.745 0 24c0 11.979 8.776 21.908 20.25 23.708V30.938H14.16V24h6.09v-5.28c0-6.012 3.582-9.336 9.062-9.336 2.625 0 5.372.468 5.372.468v5.906h-3.026c-2.98 0-3.908 1.849-3.908 3.748V24h6.657l-1.065 6.938H27.75v16.77C39.224 45.908 48 35.979 48 24 48 10.745 37.255 0 24 0z"
				/>
			</svg>
		),
		link: "https://www.facebook.com",
	},
	{
		name: "Twitter",
		svg: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 48 48"
				fill="currentColor"
				shapeRendering="geometricPrecision"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M24 0C10.745 0 0 10.745 0 24c0 13.255 10.745 24 24 24s24-10.745 24-24C48 10.745 37.255 0 24 0zm12.132 19.29c.366 8.08-5.66 17.088-16.328 17.088-3.244 0-6.262-.952-8.804-2.582 3.048.36 6.09-.488 8.504-2.378-2.512-.046-4.634-1.708-5.368-3.99.902.172 1.79.122 2.596-.098-2.762-.556-4.67-3.044-4.608-5.706.776.43 1.66.688 2.602.718-2.558-1.71-3.282-5.088-1.778-7.67 2.832 3.476 7.066 5.762 11.84 6.002-.838-3.592 1.888-7.054 5.598-7.054 1.65 0 3.144.698 4.192 1.814 1.308-.256 2.54-.736 3.648-1.394-.43 1.342-1.34 2.466-2.526 3.178 1.162-.14 2.27-.448 3.298-.906-.768 1.156-1.74 2.168-2.868 2.978z"
				/>
			</svg>
		),
		link: "https://www.twitter.com",
	},
	{
		name: "Instagram",
		svg: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 48 48"
				fill="currentColor"
				shapeRendering="geometricPrecision"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M24 0C10.745 0 0 10.745 0 24s10.745 24 24 24 24-10.745 24-24S37.255 0 24 0zm11.75 18.5c0-1.8-.2-3.6-1.2-5.1-1-1.5-2.5-2.6-4.3-2.9-1.5-.3-3.2-.3-6.25-.3s-4.75 0-6.25.3c-1.8.3-3.3 1.4-4.3 2.9-1 1.5-1.2 3.3-1.2 5.1s0 3.6.3 5.1c.3 1.8 1.4 3.3 2.9 4.3 1.5 1 3.3 1.2 5.1 1.2s3.6 0 5.1-.3c1.8-.3 3.3-1.4 4.3-2.9 1-1.5 1.2-3.3 1.2-5.1v-5.2zm-2.6 5.2c0 1.6-.2 2.8-.7 3.7-.6 1.1-1.6 1.8-2.8 2-1.3.2-2.7.2-5.6.2s-4.3 0-5.6-.2c-1.2-.2-2.2-.9-2.8-2-.5-.9-.7-2.1-.7-3.7s.2-2.8.7-3.7c.6-1.1 1.6-1.8 2.8-2 1.3-.2 2.7-.2 5.6-.2s4.3 0 5.6.2c1.2.2 2.2.9 2.8 2 .5.9.7 2.1.7 3.7zm-4.7 0c0 2.6-2.1 4.7-4.7 4.7s-4.7-2.1-4.7-4.7 2.1-4.7 4.7-4.7 4.7 2.1 4.7 4.7zm-2.4 0c0-1.3-1-2.3-2.3-2.3s-2.3 1-2.3 2.3 1 2.3 2.3 2.3 2.3-1 2.3-2.3zm5.7-5.5c0 .7-.6 1.3-1.3 1.3s-1.3-.6-1.3-1.3.6-1.3 1.3-1.3 1.3.6 1.3 1.3z"
				/>
			</svg>
		),
		link: "https://www.instagram.com",
	},
];

const Navbar = () => {
	const [active, setActive] = useState(false);

	const onTogglerClick = () => {
		setActive(!active);
	};

	return (
		<nav className="navbar">
			<div className={`container ${active === true ? "active" : ""}`}>
				<div className="bt-container">
					<Link to="/" className="brand">
						<img src={logo} alt="WBSHA Logo" width="32" height="32" />
						WBSHA
					</Link>
					<Toggler onTogglerClick={onTogglerClick} />
				</div>
				<div className="links">{renderNavLinks()}</div>
				<div className="socials">{renderSocials()}</div>
			</div>
		</nav>
	);
};

const Toggler = (props) => {
	return (
		<svg
			onClick={props.onTogglerClick}
			className="toggler no-select"
			width="24"
			height="24"
			xmlns="http://www.w3.org/2000/svg"
			fillRule="evenodd"
			clipRule="evenodd"
		>
			<path
				d="M24 18v1h-24v-1h24zm0-6v1h-24v-1h24zm0-6v1h-24v-1h24z"
				fill="#1040e2"
			/>
			<path d="M24 19h-24v-1h24v1zm0-6h-24v-1h24v1zm0-6h-24v-1h24v1z" />
		</svg>
	);
};

const renderNavLinks = () => {
	return navLinksData.map((item, index) => {
		return (
			<Link to={item.link} className="link" key={index}>
				{item.name}
			</Link>
		);
	});
};

const renderSocials = () => {
	return socialData.map((item, index) => {
		return (
			<a
				href={item.link}
				className="social"
				key={index}
				target="_blank"
				rel="noopener noreferrer"
			>
				{item.svg}
			</a>
		);
	});
};

export default Navbar;
