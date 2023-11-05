import React from "react";
import "../../styles/home/contact-section.scss";
import Button from "../general/Button";

const ContactSection = () => {
	const renderForm = () => {
		return (
			<div className="right">
				<div className="text">Get in Touch</div>
				<form>
					<div className="group">
						<label htmlFor="name">Full Name</label>
						<input
							type="text"
							className="form-control border-0 rounded-0"
							id="name"
							aria-describedby="Full Name"
							placeholder="Enter full name"
						/>
					</div>
					<div className="group">
						<label htmlFor="email">Email Address</label>
						<input
							type="email"
							className="form-control border-0 rounded-0"
							id="email"
							aria-describedby="Email"
							placeholder="Enter email address"
						/>
					</div>
					<div className="group">
						<label htmlFor="phone">Phone Number</label>
						<input
							type="text"
							className="form-control border-0 rounded-0"
							id="phone"
							aria-describedby="Phone Number"
							placeholder="Enter phone number"
						/>
					</div>
					<div className="group">
						<label htmlFor="password">Message</label>
						<textarea
							className="form-control border-0 rounded-0"
							id="message"
							rows="5"
							placeholder="Enter your message"
						/>
					</div>
					<Button text="Submit" url="#" />
				</form>
			</div>
		);
	};

	return (
		<div className="contact-section">
			<div className="container">
				<div className="left">
					<div className="title">Contact Us</div>
					<div className="details">
						<p>
							Lorem ipsum dolor sit amet, consectetur adipisicing
							elit. Doloribus eum maiores mollitia nobis
							recusandae, veniam. Dignissimos eligendi optio quo
							suscipit voluptatum! Ad dolores ducimus facere
							laboriosam non pariatur repellat voluptate.
						</p>
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
							{/* <div className="map-canvas">
								<iframe
									title="map"
									width="100%"
									height="600"
									frameBorder="0"
									scrolling="no"
									marginHeight="0"
									marginWidth="0"
									src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=1%20Grafton%20Street,%20Dublin,%20Ireland+(West%20Bengal%20State%20Handball%20Association)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
								></iframe>
							</div> */}
						</div>
					</div>
				</div>
				{renderForm()}
			</div>
		</div>
	);
};

export default ContactSection;
