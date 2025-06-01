import React from "react";
import { auth, provider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "../styles/login-page.scss";

export const LoginPage = () => {
	const navigate = useNavigate();
	const signInWithGoogle = () => {
		signInWithPopup(auth, provider)
			.then((result) => {
				navigate("/admin");
			})
			.catch((error) => {
				console.log(error.message);
			});
	};
	return (
		<div className="main-content about-page">
			<div className="content container">
				<div className="page-title">Authentication</div>
				<div className="login">
					<div className="page-heading">Login with Google</div>
					<div className="login-text">
						<p>Access to the administrator dashboard is restricted. Only authorized users can access the dashboard. If you are an authorized user, please click on the button below to login with your Google account. This will give you access to the admin dashboard.</p>
						<div onClick={signInWithGoogle} className="button no-select" text="">Click Here</div>
					</div>
				</div>
			</div>
		</div>

	);
};
