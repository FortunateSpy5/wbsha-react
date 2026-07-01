import React, { useEffect, useState, useRef } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import { Link } from "react-router-dom";
import "../styles/competitions/competitions-page.scss";

export const CompetitionsPage = () => {
	const [competitions, setCompetitions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentMonth, setCurrentMonth] = useState(new Date());
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [selectedYear, setSelectedYear] = useState("All");
	const listRef = useRef(null);
	const compRefs = useRef({});

	useEffect(() => {
		const fetchCompetitions = async () => {
			try {
				const data = await getDocs(collection(db, "competitions"));
				const mappedData = data.docs.map((doc) => {
					const docData = doc.data();
					return {
						...docData,
						id: doc.id,
						startDate: docData.startDate?.toDate?.() || new Date(docData.startDate),
						endDate: docData.endDate?.toDate?.() || (docData.endDate ? new Date(docData.endDate) : null),
					};
				});
				const sortedData = mappedData.sort((a, b) => b.startDate - a.startDate);
				setCompetitions(sortedData);
			} catch (error) {
				console.error("Error fetching competitions:", error);
			}
			setLoading(false);
		};
		fetchCompetitions();
	}, []);

	// Calendar calculation logic
	const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
	const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

	const handlePrevMonth = () => {
		setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
	};

	const handleNextMonth = () => {
		setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
	};

	// Unique years list
	const yearsList = Array.from(new Set(competitions.map((comp) => new Date(comp.startDate).getFullYear().toString())));
	const uniqueYears = ["All", ...yearsList.sort((a, b) => b - a)];

	// Filter competitions by year
	const filteredCompetitions = selectedYear === "All"
		? competitions
		: competitions.filter((comp) => new Date(comp.startDate).getFullYear().toString() === selectedYear);

	const handleYearChange = (year) => {
		setSelectedYear(year);
		if (year !== "All") {
			const yearComps = competitions.filter((comp) => new Date(comp.startDate).getFullYear().toString() === year);
			if (yearComps.length > 0) {
				// Focus calendar on first competition date of selected year
				setCurrentMonth(new Date(yearComps[0].startDate));
			} else {
				setCurrentMonth(new Date(parseInt(year), 0, 1));
			}
		}
	};

	const renderCalendar = () => {
		const year = currentMonth.getFullYear();
		const month = currentMonth.getMonth();
		const daysInMonth = getDaysInMonth(year, month);
		const firstDay = getFirstDayOfMonth(year, month);
		
		// Shift to make Mon first day of week:
		let firstDayIndex = firstDay === 0 ? 6 : firstDay - 1;

		const days = [];
		// Padding days for previous month
		for (let i = 0; i < firstDayIndex; i++) {
			days.push(<div key={`empty-${i}`} className="calendar-day empty" />);
		}

		// Days of current month
		for (let day = 1; day <= daysInMonth; day++) {
			const cellDate = new Date(year, month, day);
			
			// Find competitions on this day (using filteredCompetitions)
			const dayComps = filteredCompetitions.filter((comp) => {
				const start = new Date(comp.startDate);
				start.setHours(0,0,0,0);
				const end = comp.endDate ? new Date(comp.endDate) : new Date(comp.startDate);
				end.setHours(23,59,59,999);
				
				const cellTime = cellDate.getTime();
				return cellTime >= start.getTime() && cellTime <= end.getTime();
			});

			const hasComp = dayComps.length > 0;
			const isToday = new Date().toDateString() === cellDate.toDateString();

			days.push(
				<div
					key={day}
					className={`calendar-day ${hasComp ? "has-competition" : ""} ${isToday ? "today" : ""}`}
					onClick={() => {
						if (hasComp) {
							const targetCompId = dayComps[0].id;
							if (compRefs.current[targetCompId]) {
								compRefs.current[targetCompId].scrollIntoView({
									behavior: "smooth",
									block: "center",
								});
							}
						}
					}}
				>
					<span className="day-number">{day}</span>
					{hasComp && <span className="comp-dot" />}
				</div>
			);
		}

		return days;
	};

	const monthNames = [
		"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"
	];

	const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

	return (
		<div className="main-content competitions-page">
			<div className="content container">
				<div className="page-title">Competitions & Tournaments</div>
				
				{/* Filtering controls panel */}
				<div className="competitions-controls">
					<div className="year-filter-box">
						<label htmlFor="year-select">Select Year: </label>
						<select 
							id="year-select"
							value={selectedYear}
							onChange={(e) => handleYearChange(e.target.value)}
						>
							{uniqueYears.map((yr) => (
								<option key={yr} value={yr}>{yr}</option>
							))}
						</select>
					</div>

					<button 
						className="calendar-toggle-btn button"
						onClick={() => setIsCalendarOpen(!isCalendarOpen)}
					>
						{isCalendarOpen ? "📅 Hide Calendar Grid" : "📅 Open Calendar Grid"}
					</button>
				</div>

				{/* Toggleable Calendar Section */}
				{isCalendarOpen && (
					<div className="calendar-section">
						<div className="calendar-header">
							<button className="nav-arrow" onClick={handlePrevMonth}>&#10094;</button>
							<h2 className="current-month-year">
								{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
							</h2>
							<button className="nav-arrow" onClick={handleNextMonth}>&#10095;</button>
						</div>

						<div className="calendar-grid">
							{daysOfWeek.map((day) => (
								<div key={day} className="calendar-day-header">{day}</div>
							))}
							{renderCalendar()}
						</div>
					</div>
				)}

				<div className="competitions-list-section" ref={listRef}>
					<h2 className="page-heading">
						{selectedYear === "All" ? "All Competitions" : `${selectedYear} Competitions`}
					</h2>
					{loading ? (
						<div className="skeleton-competitions-grid">
							{[...Array(3)].map((_, i) => (
								<div key={i} className="skeleton-competition-card">
									<div className="skeleton-badge" />
									<div className="skeleton-title" />
									<div className="skeleton-text" />
									<div className="skeleton-btn" />
								</div>
							))}
						</div>
					) : filteredCompetitions.length === 0 ? (
						<div className="loading">No competitions listed for this filter.</div>
					) : (
						<div className="competitions-grid">
							{filteredCompetitions.map((comp) => (
								<div 
									key={comp.id} 
									className="competition-card"
									ref={(el) => (compRefs.current[comp.id] = el)}
								>
									<div className="card-header">
										<h3 className="competition-card-title">{comp.title}</h3>
										{comp.venue && <span className="competition-venue">{comp.venue}</span>}
									</div>
									<div className="competition-dates">
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: "6px", verticalAlign: "middle"}}>
											<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
											<line x1="16" y1="2" x2="16" y2="6" />
											<line x1="8" y1="2" x2="8" y2="6" />
											<line x1="3" y1="10" x2="21" y2="10" />
										</svg>
										{new Date(comp.startDate).toLocaleDateString()}
										{comp.endDate && ` - ${new Date(comp.endDate).toLocaleDateString()}`}
									</div>
									<p className="competition-excerpt">
										{comp.content.replace(/<[^>]+>/g, "").substring(0, 180)}...
									</p>
									<Link to={`/competitions/${comp.id}`} className="read-more-btn button">
										View Details & Gallery
									</Link>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
