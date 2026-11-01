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
		<div className="main-content login-page">
			<div className="login">
				<h1 className="page-heading">Dashboard Administration</h1>
				<div className="login-text">
					<p>
						Access to the administrator dashboard is restricted to authorized association members. Please authenticate using your official registered Google account below to proceed.
					</p>
					<button onClick={signInWithGoogle} className="button no-select">
						Login with Google
					</button>
				</div>
			</div>
		</div>
	);
};
