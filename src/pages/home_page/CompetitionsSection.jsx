import React, { useEffect, useState } from "react";
import "../../styles/home/competitions-section.scss";
import SectionTitle from "./SectionTitle";
import { Link } from "react-router-dom";
import { getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { db } from "../../config/firebase";

const CompetitionsSection = () => {
	const [competitions, setCompetitions] = useState([]);

	useEffect(() => {
		const cached = sessionStorage.getItem("home_competitions");
		if (cached) {
			try {
				const parsed = JSON.parse(cached);
				setCompetitions(parsed.map(c => ({
					...c,
					startDate: new Date(c.startDate),
					endDate: c.endDate ? new Date(c.endDate) : null
				})));
				return;
			} catch (e) {
				sessionStorage.removeItem("home_competitions");
			}
		}

		const fetchCompetitions = async () => {
			try {
				let data;
				try {
					const q = query(collection(db, "competitions"), orderBy("startDate", "desc"), limit(6));
					data = await getDocs(q);
				} catch (queryErr) {
					const fallbackQ = query(collection(db, "competitions"), limit(12));
					data = await getDocs(fallbackQ);
				}
				const mappedData = data.docs.map((doc) => {
					const docData = doc.data();
					let parsedStart = new Date();
					let parsedEnd = null;
					if (docData.startDate) {
						parsedStart = docData.startDate.toDate ? docData.startDate.toDate() : new Date(docData.startDate);
					}
					if (docData.endDate) {
						parsedEnd = docData.endDate.toDate ? docData.endDate.toDate() : new Date(docData.endDate);
					}
					return {
						...docData,
						id: doc.id,
						startDate: parsedStart,
						endDate: parsedEnd
					};
				});
				const sortedData = mappedData.sort((a, b) => b.startDate - a.startDate).slice(0, 3);
				setCompetitions(sortedData);
				sessionStorage.setItem("home_competitions", JSON.stringify(sortedData));
			} catch (error) {
				console.error("Error fetching competitions for home page:", error);
			}
		};
		fetchCompetitions();
	}, []);

	return (
		<div className="competitions-section-home">
			<SectionTitle title="Competitions" text="All Tournaments" link="/competitions" />
			{competitions.length === 0 ? (
				<div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
					No tournament details available.
				</div>
			) : (
				<div className="competitions-fullwidth-grid">
					{competitions.map((comp) => (
						<div key={comp.id} className={`home-comp-card ${comp.mainImageUrl ? "has-banner" : ""}`}>
							{comp.mainImageUrl && (
								<div 
									className="card-bg-image" 
									style={{ backgroundImage: `url("${comp.mainImageUrl}")` }} 
								/>
							)}
							<div className="card-bg-gradient" />
							<div className="card-info">
								<span className="comp-dates-badge">
									{comp.startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
									{comp.endDate ? ` - ${comp.endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}` : ` ${comp.startDate.getFullYear()}`}
								</span>
								<h3 className="comp-title">{comp.title}</h3>
								{comp.venue && <p className="comp-venue">📍 {comp.venue}</p>}
								<div className="card-actions">
									<Link to={`/competitions/${comp.id}`} className="view-details-btn">
										View Details &rarr;
									</Link>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default CompetitionsSection;
