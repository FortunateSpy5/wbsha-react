import React from "react";
import { socialData, navLinksData } from "./Navbar";
import { Link } from "react-router-dom";
import "../../styles/footer.scss";

const Footer = () => {
	const renderBackToTop = () => {
		return (
			<div
				className="top"
				onClick={() => {
					window.scrollTo({ top: 0, behavior: "smooth" });
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
				>
					<path d="M0 16.67l2.829 2.83 9.175-9.339 9.167 9.339 2.829-2.83-11.996-12.17z" />
				</svg>
				<div>Back to top</div>
			</div>
		);
	};

	const renderSocials = () => {
		return socialData.map((item, index) => {
			return (
				<Link key={index} to={item.link} className="social">
					{item.svg}
					<span>{item.name}</span>
				</Link>
			);
		});
	};

	const renderNav = () => {
		return navLinksData.map((item, index) => {
			return (
				<Link to={item.link} className="link" key={index}>
					{item.name}
				</Link>
			);
		});
	};

	return (
		<footer className="footer">
			{renderBackToTop()}
			<div className="content">
				<div className="socials section">
					<Link to="/" className="brand">
						WBSHA
					</Link>
					{renderSocials()}
				</div>
				<div className="navigation section">
					<div className="heading">Navigation</div>
					<div className="links">{renderNav()}</div>
				</div>
				<div className="contact section">
					<div className="heading">Contact</div>
					<div className="contacts">
						<div className="unit">
							<div className="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
								>
									<path d="M12 12.713l-11.985-9.713h23.971l-11.986 9.713zm-5.425-1.822l-6.575-5.329v12.501l6.575-7.172zm10.85 0l6.575 7.172v-12.501l-6.575 5.329zm-1.557 1.261l-3.868 3.135-3.868-3.135-8.11 8.848h23.956l-8.11-8.848z" />
								</svg>
							</div>
							<span>wbsha1973@gmail.com</span>
						</div>
						<div className="unit">
							<div className="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
								>
									<path d="M20 22.621l-3.521-6.795c-.008.004-1.974.97-2.064 1.011-2.24 1.086-6.799-7.82-4.609-8.994l2.083-1.026-3.493-6.817-2.106 1.039c-7.202 3.755 4.233 25.982 11.6 22.615.121-.055 2.102-1.029 2.11-1.033z" />
								</svg>
							</div>
							<span>(033) 2252 2233</span>
						</div>
						<div className="unit">
							<div className="icon">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
								>
									<path d="M12 0c-4.198 0-8 3.403-8 7.602 0 4.198 3.469 9.21 8 16.398 4.531-7.188 8-12.2 8-16.398 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
								</svg>
							</div>
							<div>
								1, Nelly Sengupta Sarani (Lindsay Street),
								<br />2<sup>nd</sup> Floor, New Market,
								<br />
								Kolkata - 700087
							</div>
						</div>
					</div>
				</div>
				<div className="other section">
					<div className="heading">Other Links</div>
					<div>
						<Link to="/admin" className="link">
							Admin
						</Link>
						<br />
						<br />
						<br />
					</div>
				</div>
			</div>
			<div className="bottom">
				<div>&#169; 2020 West Bengal State Handball Association</div>
				<div>
					Website developed by{" "}
					<a href="https://github.com/FortunateSpy5">Soumotanu Mazumdar</a>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
