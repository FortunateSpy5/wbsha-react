import React from "react";
import { Link } from "react-router-dom";
import "../../styles/general/button.scss";

const Button = (props) => {
	return (
		<Link className="button" to={props.url}>
			{props.text}
		</Link>
	);
};

export default Button;
