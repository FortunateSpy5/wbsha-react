import React from "react";
import { auth, provider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

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
		<div className="main-content container">
			<p>Sign in with google</p>
			<button onClick={signInWithGoogle}>Sign in</button>
		</div>
	);
};
