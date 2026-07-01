import React from "react";
import { Link } from "react-router-dom";
import "../../styles/general/button.scss";

const Button = (props) => {
	const { href, url, text, children, className, ...rest } = props;
	const combinedClass = className ? `button ${className}` : "button";

	if (href) {
		return (
			<a className={combinedClass} href={href} target="_blank" rel="noopener noreferrer" {...rest}>
				{children || text}
			</a>
		);
	}

	if (url) {
		return (
			<Link className={combinedClass} to={url} {...rest}>
				{children || text}
			</Link>
		);
	}

	return (
		<button className={combinedClass} {...rest}>
			{children || text}
		</button>
	);
};

export default Button;
