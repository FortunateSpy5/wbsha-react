import React, { useEffect, useState } from "react";
import "../../styles/home/competitions-section.scss";
import SectionTitle from "./SectionTitle";
import { Link } from "react-router-dom";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../config/firebase";

const CompetitionsSection = () => {
	const [competitions, setCompetitions] = useState([]);

	useEffect(() => {
		const fetchCompetitions = async () => {
			try {
				const data = await getDocs(collection(db, "competitions"));
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
									{new Date(comp.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
									{comp.endDate && ` - ${new Date(comp.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}`}
								</span>
								<h3 className="comp-title">{comp.title}</h3>
								{comp.venue && (
									<div className="comp-venue">
										<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "4px", verticalAlign: "middle"}}>
											<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
											<circle cx="12" cy="10" r="3" />
										</svg>
										{comp.venue}
									</div>
								)}
								<p className="comp-desc">
									{comp.content.replace(/<[^>]+>/g, "").substring(0, 110)}...
								</p>
								<Link to={`/competitions/${comp.id}`} className="view-details-btn">
									View Roster & Standings &rarr;
								</Link>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default CompetitionsSection;
