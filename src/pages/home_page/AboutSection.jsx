import React from "react";
import "../../styles/home/about-section.scss";
import Button from "../general/Button";
import home_about from "../../assets/home_about.jpeg";

const AboutSection = () => {
	return (
		<div className="about-section">
			<div className="content container">
				<div>
					<div className="title">About Us</div>
					<div className="text">
						<p>
							Lorem ipsum dolor sit amet, consectetur adipisicing
							elit. Assumenda, non, reiciendis. A ad architecto,
							at aut cupiditate doloribus ducimus ipsam libero
							mollitia nihil praesentium quaerat quos recusandae
							sint sunt unde?
						</p>
						<p>
							Lorem ipsum dolor sit amet, consectetur adipisicing
							elit. Amet architecto assumenda, consequatur culpa
							cum dolore eligendi est illum laborum laudantium
							molestias, nam nemo qui recusandae repudiandae sit
							velit? Iste, iure?
						</p>
					</div>
					<Button url="/about" text="Know More" />
				</div>
				<div className="image">
					<img src={home_about} alt="home_about" />
				</div>
			</div>
		</div>
	);
};

export default AboutSection;
