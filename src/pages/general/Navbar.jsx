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
				viewBox="0 0 24 24"
				fill="currentColor"
				shapeRendering="geometricPrecision"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z"
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
				viewBox="0 0 24 24"
				fill="currentColor"
				shapeRendering="geometricPrecision"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z"
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
				viewBox="0 0 24 24"
				fill="currentColor"
				shapeRendering="geometricPrecision"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M 12 0 C 18.627 0 24 5.373 24 12 C 24 18.627 18.627 24 12 24 C 5.373 24 0 18.627 0 12 C 0 5.373 5.373 0 12 0 Z M 12 6 L 14.7 6 C 16.52 6 18 7.48 18 9.3 L 18 14.7 C 18 16.52 16.52 18 14.7 18 L 9.3 18 C 7.48 18 6 16.52 6 14.7 L 6 9.3 C 6 7.48 7.48 6 9.3 6 Z M 12 7.2 L 14.7 7.2 C 15.86 7.2 16.8 8.14 16.8 9.3 L 16.8 14.7 C 16.8 15.86 15.86 16.8 14.7 16.8 L 9.3 16.8 C 8.14 16.8 7.2 15.86 7.2 14.7 L 7.2 9.3 C 7.2 8.14 8.14 7.2 9.3 7.2 Z M 12 9 C 13.66 9 15 10.34 15 12 C 15 13.66 13.66 15 12 15 C 10.34 15 9 13.66 9 12 C 9 10.34 10.34 9 12 9 Z M 12 10.2 C 12.99 10.2 13.8 11.01 13.8 12 C 13.8 12.99 12.99 13.8 12 13.8 C 11.01 13.8 10.2 12.99 10.2 12 C 10.2 11.01 11.01 10.2 12 10.2 Z M 15.8 7.45 C 16.21 7.45 16.55 7.79 16.55 8.2 C 16.55 8.61 16.21 8.95 15.8 8.95 C 15.39 8.95 15.05 8.61 15.05 8.2 C 15.05 7.79 15.39 7.45 15.8 7.45 Z"
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
				aria-label={item.name}
				title={item.name}
				target="_blank"
				rel="noopener noreferrer"
			>
				{item.svg}
			</a>
		);
	});
};

export default Navbar;
