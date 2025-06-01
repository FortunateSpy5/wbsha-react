import React from "react";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { HeroAdmin } from "./admin_page/HeroAdmin";

export const AdminPage = () => {
	const navigate = useNavigate();
	const [user] = useAuthState(auth);
	if (!user) {
		navigate("/login");
		return null;
	}
	return (
		<div className="main-content container admin-content">
			<p>Admin Page</p>
			<p>{auth.currentUser?.email}</p>
			<button onClick={() => auth.signOut()}>Sign out</button>
			<HeroAdmin />
		</div>
	);
};
