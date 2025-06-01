import React from "react";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { HeroAdmin } from "./admin_page/HeroAdmin";
import {CollapsibleAdminSection} from "./general/CollapsibleAdminSection";
import "../styles/admin/admin-page.scss";

export const AdminPage = () => {
	const navigate = useNavigate();
	const [user] = useAuthState(auth);
	if (!user) {
		navigate("/login");
		return null;
	}
	return (
		<div className="main-content admin-page">
			<div className="content container">
				<div className="page-title">Admin Dashboard</div>
				<div className="page-heading">Welcome, {user.displayName || "Admin"}</div>
				<div className="intro">
					<p>
						This is the admin dashboard where you can manage the website content.
					</p>
					<div className="button" onClick={() => auth.signOut()}>Sign out</div>
				</div>
				<CollapsibleAdminSection title="Manage Heroes">
				<HeroAdmin />
				</CollapsibleAdminSection>
			</div>
		</div>
	);
};
