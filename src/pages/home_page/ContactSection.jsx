import React, { useState } from "react";
import "../../styles/home/contact-section.scss";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

const ContactSection = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		message: "",
	});
	const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', or null
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleChange = (e) => {
		setFormData({ ...formData, [e.target.id]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!formData.name || !formData.email || !formData.message) {
			setSubmitStatus("error");
			return;
		}
		setIsSubmitting(true);
		try {
			await addDoc(collection(db, "contactSubmissions"), {
				...formData,
				createdAt: new Date(),
			});
			setSubmitStatus("success");
			setFormData({ name: "", email: "", phone: "", message: "" });
		} catch (error) {
			console.error("Error submitting form:", error);
			setSubmitStatus("error");
		}
		setIsSubmitting(false);
	};

	const renderForm = () => {
		return (
			<div className="right">
				<div className="text">Get in Touch</div>
				<form onSubmit={handleSubmit}>
					<div className="group">
						<label htmlFor="name">Full Name</label>
						<input
							type="text"
							className="form-control border-0 rounded-0"
							id="name"
							aria-describedby="Full Name"
							placeholder="Enter full name"
							value={formData.name}
							onChange={handleChange}
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
							value={formData.email}
							onChange={handleChange}
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
							value={formData.phone}
							onChange={handleChange}
						/>
					</div>
					<div className="group">
						<label htmlFor="message">Message</label>
						<textarea
							className="form-control border-0 rounded-0"
							id="message"
							rows="5"
							placeholder="Enter your message"
							value={formData.message}
							onChange={handleChange}
						/>
					</div>
					{submitStatus === "success" && (
						<div className="submit-success">
							Thank you! Your message has been sent successfully.
						</div>
					)}
					{submitStatus === "error" && (
						<div className="submit-error">
							Please fill in all required fields and try again.
						</div>
					)}
					<button
						type="submit"
						className="button"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Sending..." : "Submit"}
					</button>
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
							Have questions about handball in West Bengal? Want to
							learn more about upcoming tournaments, player
							registrations, or coaching programs? Reach out to
							the West Bengal State Handball Association — we'd
							love to hear from you.
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
						</div>
					</div>
				</div>
				{renderForm()}
			</div>
		</div>
	);
};

export default ContactSection;
