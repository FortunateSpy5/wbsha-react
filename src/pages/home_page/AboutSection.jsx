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
							West Bengal State Handball Association (WBSHA) was
							founded in 1973. It is affiliated to the Handball
							Federation of India. The association has its
							registered office in Kolkata. Handball has rapidly
							spread throughout West Bengal and numerous districts
							are actively participating in and promoting this
							sport. The performance of the Bengal team, as well
							as individual players, has been quite remarkable
							since the inception of the game in the state in
							1973.
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
