import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/navbar.scss";
import logo from "../../assets/logo.svg";

export const navLinksData = [
	{ name: "Home", link: "/" },
	{ name: "About", link: "/about" },
	{ name: "News", link: "/news" },
	{ name: "Associations", link: "/associations" },
	{ name: "Competitions", link: "/competitions" },
	{ name: "Statutes", link: "/statutes" },
	{ name: "Media", link: "/media" },
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
			>
				<path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" />
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
			>
				<path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z" />
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
			>
				<path d="M14.829 6.302c-.738-.034-.96-.04-2.829-.04s-2.09.007-2.828.04c-1.899.087-2.783.986-2.87 2.87-.033.738-.041.959-.041 2.828s.008 2.09.041 2.829c.087 1.879.967 2.783 2.87 2.87.737.033.959.041 2.828.041 1.87 0 2.091-.007 2.829-.041 1.899-.086 2.782-.988 2.87-2.87.033-.738.04-.96.04-2.829s-.007-2.09-.04-2.828c-.088-1.883-.973-2.783-2.87-2.87zm-2.829 9.293c-1.985 0-3.595-1.609-3.595-3.595 0-1.985 1.61-3.594 3.595-3.594s3.595 1.609 3.595 3.594c0 1.985-1.61 3.595-3.595 3.595zm3.737-6.491c-.464 0-.84-.376-.84-.84 0-.464.376-.84.84-.84.464 0 .84.376.84.84 0 .463-.376.84-.84.84zm-1.404 2.896c0 1.289-1.045 2.333-2.333 2.333s-2.333-1.044-2.333-2.333c0-1.289 1.045-2.333 2.333-2.333s2.333 1.044 2.333 2.333zm-2.333-12c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.958 14.886c-.115 2.545-1.532 3.955-4.071 4.072-.747.034-.986.042-2.887.042s-2.139-.008-2.886-.042c-2.544-.117-3.955-1.529-4.072-4.072-.034-.746-.042-.985-.042-2.886 0-1.901.008-2.139.042-2.886.117-2.544 1.529-3.955 4.072-4.071.747-.035.985-.043 2.886-.043s2.14.008 2.887.043c2.545.117 3.957 1.532 4.071 4.071.034.747.042.985.042 2.886 0 1.901-.008 2.14-.042 2.886z" />
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
						<img src={logo} alt="logo" />
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
