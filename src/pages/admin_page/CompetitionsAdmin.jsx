import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
	addDoc,
	collection,
	getDocs,
	updateDoc,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import {
	ref,
	uploadBytes,
	getDownloadURL,
	deleteObject,
} from "firebase/storage";
import "../../styles/admin/competitions-admin.scss";

export const CompetitionsAdmin = () => {
	const [competitionsData, setCompetitionsData] = useState([]);
	const [editingCompetition, setEditingCompetition] = useState(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [mainImageFile, setMainImageFile] = useState(null);

	const competitionsRef = collection(db, "competitions");

	const fetchCompetitions = async () => {
		try {
			const data = await getDocs(competitionsRef);
			const mappedData = data.docs.map((doc) => {
				const docData = doc.data();
				return {
					...docData,
					id: doc.id,
					startDate: docData.startDate?.toDate(),
					endDate: docData.endDate?.toDate(),
				};
			});
			setCompetitionsData(mappedData);
		} catch (error) {
			console.error("Error fetching competitions:", error);
		}
	};

	useEffect(() => {
		fetchCompetitions();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const schema = yup.object().shape({
		title: yup.string().required("Title is required"),
		startDate: yup.date().required("Start date is required"),
		endDate: yup.date().nullable().transform((curr, orig) => orig === '' ? null : curr),
		venue: yup.string().nullable(),
		content: yup.string().required("Content is required"),
		results: yup.string().nullable(),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: yupResolver(schema),
	});

	useEffect(() => {
		if (editingCompetition) {
			window.scrollTo({ top: 0, behavior: "smooth" });
			reset({
				title: editingCompetition.title || "",
				startDate: editingCompetition.startDate ? editingCompetition.startDate.toISOString().split("T")[0] : "",
				endDate: editingCompetition.endDate ? editingCompetition.endDate.toISOString().split("T")[0] : "",
				venue: editingCompetition.venue || "",
				results: editingCompetition.results || "",
				content: editingCompetition.content || "",
			});
		} else {
			reset({
				title: "",
				startDate: "",
				endDate: "",
				venue: "",
				results: "",
				content: "",
			});
		}
	}, [editingCompetition, reset]);

	const onAddOrUpdateCompetition = async (data) => {
		setIsSubmitting(true);
		try {
			let mainImageUrl = editingCompetition?.mainImageUrl || null;

			if (mainImageFile) {
				if (editingCompetition?.mainImageUrl) {
					await deleteObject(ref(storage, editingCompetition.mainImageUrl)).catch(err => console.warn(err));
				}
				const fileName = `${Date.now()}_${mainImageFile.name}`;
				const storageRef = ref(storage, `competitions/banners/${fileName}`);
				await uploadBytes(storageRef, mainImageFile);
				mainImageUrl = await getDownloadURL(storageRef);
			}

			const preparedData = {
				title: data.title,
				content: data.content,
				startDate: new Date(data.startDate),
				endDate: data.endDate ? new Date(data.endDate) : null,
				venue: data.venue || null,
				results: data.results || null,
				mainImageUrl,
			};

			if (editingCompetition) {
				const competitionDoc = doc(db, "competitions", editingCompetition.id);
				await updateDoc(competitionDoc, preparedData);
				setEditingCompetition(null);
			} else {
				const newCompetition = { ...preparedData, picGroups: [], teams: [] };
				await addDoc(competitionsRef, newCompetition);
			}
			setMainImageFile(null);
			const fileInput = document.querySelector("#main-comp-banner");
			if (fileInput) fileInput.value = "";
			reset();
			sessionStorage.removeItem("competitions_data");
			sessionStorage.removeItem("home_competitions");
			fetchCompetitions();
		} catch (error) {
			console.error("Error adding/updating competition:", error);
		}
		setIsSubmitting(false);
	};

	const onDeleteCompetition = async (id) => {
		if (!window.confirm("Are you sure you want to delete this competition?")) return;
		try {
			const competition = competitionsData.find((item) => item.id === id);

			// Delete banner photo if it exists
			if (competition.mainImageUrl) {
				await deleteObject(ref(storage, competition.mainImageUrl)).catch(err => console.warn(err));
			}

			// Delete picGroups images
			for (const group of competition.picGroups || []) {
				for (const pic of group.pics || []) {
					const picRef = ref(storage, pic.url);
					await deleteObject(picRef).catch(err => console.warn(err));
				}
			}

			// Delete teams images
			for (const team of competition.teams || []) {
				if (team.groupPhotoUrl) {
					const photoRef = ref(storage, team.groupPhotoUrl);
					await deleteObject(photoRef).catch(err => console.warn(err));
				}
				for (const pic of team.pics || []) {
					const picRef = ref(storage, pic.url);
					await deleteObject(picRef).catch(err => console.warn(err));
				}
			}

			await deleteDoc(doc(db, "competitions", id));
			sessionStorage.removeItem("competitions_data");
			sessionStorage.removeItem("home_competitions");
			fetchCompetitions();
		} catch (error) {
			console.error("Error deleting competition:", error);
		}
	};

	return (
		<div className="competitions-admin">
			<h2 className="competitions-admin-title page-heading">
				{editingCompetition ? "Edit Competition Details" : "Create New Competition"}
			</h2>
			
			<form
				className="competitions-admin-form"
				onSubmit={handleSubmit(onAddOrUpdateCompetition)}
			>
				<input
					className="competitions-admin-input"
					placeholder="Title..."
					{...register("title")}
				/>
				<p className="competitions-admin-error">{errors.title?.message}</p>

				<input
					className="competitions-admin-input"
					type="date"
					placeholder="Start Date..."
					{...register("startDate")}
				/>
				<p className="competitions-admin-error">{errors.startDate?.message}</p>

				<input
					className="competitions-admin-input"
					type="date"
					placeholder="End Date (Optional)..."
					{...register("endDate")}
				/>
				<p className="competitions-admin-error">{errors.endDate?.message}</p>

				<input
					className="competitions-admin-input"
					placeholder="Venue (Optional)..."
					{...register("venue")}
				/>
				<p className="competitions-admin-error">{errors.venue?.message}</p>

				<textarea
					className="competitions-admin-input"
					placeholder="Results & Standings Summary (Optional)..."
					rows="4"
					{...register("results")}
				/>
				<p className="competitions-admin-error">{errors.results?.message}</p>

				<textarea
					className="competitions-admin-input"
					placeholder="Content description (HTML or plain text)..."
					rows="6"
					{...register("content")}
				/>
				<p className="competitions-admin-error">{errors.content?.message}</p>

				<label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#94a3b8", marginTop: "0.5rem" }}>
					Main Competition Banner Photo (Optional)
				</label>
				<input
					id="main-comp-banner"
					className="competitions-admin-file"
					type="file"
					accept="image/*"
					onChange={(e) => setMainImageFile(e.target.files[0])}
				/>
				<div style={{ marginBottom: "1rem" }} />

				<input
					className="competitions-admin-submit button"
					type="submit"
					value={editingCompetition ? "Save Details" : "Add Competition"}
					disabled={isSubmitting}
				/>
				{editingCompetition && (
					<button
						type="button"
						className="button cancel-btn"
						style={{ marginTop: "0.5rem", background: "#5a5a5a" }}
						onClick={() => {
							setEditingCompetition(null);
							reset();
						}}
					>
						Cancel Edit
					</button>
				)}
			</form>

			<h2 className="competitions-admin-title page-heading">Current Competitions List</h2>
			<div className="competitions-list">
				{competitionsData.map((competition) => (
					<CompetitionAdminCard
						key={competition.id}
						competition={competition}
						onEdit={() => setEditingCompetition(competition)}
						onDelete={() => onDeleteCompetition(competition.id)}
						onRefresh={fetchCompetitions}
					/>
				))}
			</div>
		</div>
	);
};

// Sub-component for individual competition card to manage local nested tabs
const CompetitionAdminCard = ({ competition, onEdit, onDelete, onRefresh }) => {
	const [activeSubTab, setActiveSubTab] = useState("details");

	// Album management states
	const [newGroupTitle, setNewGroupTitle] = useState("");
	const [newImageTitle, setNewImageTitle] = useState("");
	const [imageUpload, setImageUpload] = useState(null);
	const [isUploading, setIsUploading] = useState(false);

	// Team management states
	const [teamName, setTeamName] = useState("");
	const [teamStanding, setTeamStanding] = useState("");
	const [teamRank, setTeamRank] = useState("");
	const [teamInfo, setTeamInfo] = useState("");
	const [squadPhoto, setSquadPhoto] = useState(null);
	const [teamImageUpload, setTeamImageUpload] = useState(null);
	const [teamImageTitle, setTeamImageTitle] = useState("");
	const [selectedTeamIdForGallery, setSelectedTeamIdForGallery] = useState("");

	const compDocRef = doc(db, "competitions", competition.id);

	// --- ALbum Functions ---
	const onAddGroup = async () => {
		if (!newGroupTitle) {
			alert("Group title is required");
			return;
		}
		try {
			const updatedPicGroups = [
				...(competition.picGroups || []),
				{ title: newGroupTitle, pics: [] }
			];
			await updateDoc(compDocRef, { picGroups: updatedPicGroups });
			setNewGroupTitle("");
			sessionStorage.removeItem("competitions_data");
			sessionStorage.removeItem("home_competitions");
			onRefresh();
		} catch (error) {
			console.error("Error adding group:", error);
		}
	};

	const onDeleteGroup = async (groupTitle) => {
		if (!window.confirm(`Delete group "${groupTitle}"?`)) return;
		try {
			const groupToDelete = competition.picGroups.find(g => g.title === groupTitle);
			for (const pic of groupToDelete.pics || []) {
				await deleteObject(ref(storage, pic.url)).catch(err => console.warn(err));
			}
			const updatedPicGroups = competition.picGroups.filter(g => g.title !== groupTitle);
			await updateDoc(compDocRef, { picGroups: updatedPicGroups });
			sessionStorage.removeItem("competitions_data");
			sessionStorage.removeItem("home_competitions");
			onRefresh();
		} catch (error) {
			console.error("Error deleting group:", error);
		}
	};

	const onAddImageToGroup = async (groupTitle) => {
		if (!imageUpload || !newImageTitle) {
			alert("Image file and title are required");
			return;
		}
		setIsUploading(true);
		try {
			const fileName = `${Date.now()}_${imageUpload.name}`;
			const storageRef = ref(storage, `competitions/albums/${fileName}`);
			await uploadBytes(storageRef, imageUpload);
			const url = await getDownloadURL(storageRef);

			const updatedPicGroups = competition.picGroups.map(group =>
				group.title === groupTitle
					? { ...group, pics: [...(group.pics || []), { title: newImageTitle, url }] }
					: group
			);
			await updateDoc(compDocRef, { picGroups: updatedPicGroups });
			setImageUpload(null);
			setNewImageTitle("");
			const fileInput = document.querySelector(`#file-${competition.id}-${groupTitle.replace(/\s+/g, '')}`);
			if (fileInput) fileInput.value = "";
			sessionStorage.removeItem("competitions_data");
			sessionStorage.removeItem("home_competitions");
			onRefresh();
		} catch (error) {
			console.error("Error uploading picture:", error);
		}
		setIsUploading(false);
	};

	const onDeletePic = async (groupTitle, picUrl) => {
		if (!window.confirm("Delete this picture?")) return;
		try {
			await deleteObject(ref(storage, picUrl)).catch(err => console.warn(err));
			const updatedPicGroups = competition.picGroups.map(group =>
				group.title === groupTitle
					? { ...group, pics: group.pics.filter(pic => pic.url !== picUrl) }
					: group
			);
			await updateDoc(compDocRef, { picGroups: updatedPicGroups });
			sessionStorage.removeItem("competitions_data");
			sessionStorage.removeItem("home_competitions");
			onRefresh();
		} catch (error) {
			console.error("Error deleting picture:", error);
		}
	};

	// --- Team Functions ---
	const onAddTeam = async (e) => {
		e.preventDefault();
		if (!teamName) {
			alert("Team name is required");
			return;
		}
		setIsUploading(true);
		try {
			let groupPhotoUrl = null;
			if (squadPhoto) {
				const fileName = `${Date.now()}_${squadPhoto.name}`;
				const storageRef = ref(storage, `competitions/teams/squads/${fileName}`);
				await uploadBytes(storageRef, squadPhoto);
				groupPhotoUrl = await getDownloadURL(storageRef);
			}

			const newTeam = {
				id: `team_${Date.now()}`,
				name: teamName,
				standing: teamStanding || "",
				rank: teamRank ? parseInt(teamRank) : 0,
				additionalInfo: teamInfo || "",
				groupPhotoUrl,
				pics: []
			};

			const updatedTeams = [...(competition.teams || []), newTeam];
			await updateDoc(compDocRef, { teams: updatedTeams });

			setTeamName("");
			setTeamStanding("");
			setTeamRank("");
			setTeamInfo("");
			setSquadPhoto(null);
			const fileInput = document.querySelector(`#squadPhoto-${competition.id}`);
			if (fileInput) fileInput.value = "";

			sessionStorage.removeItem("competitions_data");
			sessionStorage.removeItem("home_competitions");
			onRefresh();
		} catch (error) {
			console.error("Error adding team:", error);
		}
		setIsUploading(false);
	};

	const onDeleteTeam = async (teamId) => {
		if (!window.confirm("Are you sure you want to delete this team profile? This will clear all their action shots.")) return;
		try {
			const team = competition.teams.find(t => t.id === teamId);
			if (team.groupPhotoUrl) {
				await deleteObject(ref(storage, team.groupPhotoUrl)).catch(err => console.warn(err));
			}
			for (const pic of team.pics || []) {
				await deleteObject(ref(storage, pic.url)).catch(err => console.warn(err));
			}
			const updatedTeams = competition.teams.filter(t => t.id !== teamId);
			await updateDoc(compDocRef, { teams: updatedTeams });
			sessionStorage.removeItem("competitions_data");
			sessionStorage.removeItem("home_competitions");
			onRefresh();
		} catch (error) {
			console.error("Error deleting team:", error);
		}
	};

	const onAddTeamPic = async (teamId) => {
		if (!teamImageUpload || !teamImageTitle) {
			alert("Action photo file and title are required");
			return;
		}
		setIsUploading(true);
		try {
			const fileName = `${Date.now()}_${teamImageUpload.name}`;
			const storageRef = ref(storage, `competitions/teams/pics/${fileName}`);
			await uploadBytes(storageRef, teamImageUpload);
			const url = await getDownloadURL(storageRef);

			const updatedTeams = competition.teams.map(team =>
				team.id === teamId
					? { ...team, pics: [...(team.pics || []), { title: teamImageTitle, url }] }
					: team
			);

			await updateDoc(compDocRef, { teams: updatedTeams });
			setTeamImageUpload(null);
			setTeamImageTitle("");
			const fileInput = document.querySelector(`#teampic-${competition.id}-${teamId}`);
			if (fileInput) fileInput.value = "";
			sessionStorage.removeItem("competitions_data");
			sessionStorage.removeItem("home_competitions");
			onRefresh();
		} catch (error) {
			console.error("Error uploading team photo:", error);
		}
		setIsUploading(false);
	};

	const onDeleteTeamPic = async (teamId, picUrl) => {
		if (!window.confirm("Delete this action photo?")) return;
		try {
			await deleteObject(ref(storage, picUrl)).catch(err => console.warn(err));
			const updatedTeams = competition.teams.map(team =>
				team.id === teamId
					? { ...team, pics: team.pics.filter(p => p.url !== picUrl) }
					: team
			);
			await updateDoc(compDocRef, { teams: updatedTeams });
			sessionStorage.removeItem("competitions_data");
			sessionStorage.removeItem("home_competitions");
			onRefresh();
		} catch (error) {
			console.error("Error deleting team action photo:", error);
		}
	};

	return (
		<div className="competition-admin-card">
			<div className="card-header-bar">
				<h3 className="card-comp-title">{competition.title}</h3>
				<div className="card-controls">
					<button className="btn-edit" onClick={onEdit}>Edit Info</button>
					<button className="btn-delete" onClick={onDelete}>Delete Event</button>
				</div>
			</div>

			<div className="nested-tabs-menu">
				<button 
					className={`nested-tab-btn ${activeSubTab === "details" ? "active" : ""}`}
					onClick={() => setActiveSubTab("details")}
				>
					ℹ️ Info Overview
				</button>
				<button 
					className={`nested-tab-btn ${activeSubTab === "albums" ? "active" : ""}`}
					onClick={() => setActiveSubTab("albums")}
				>
					🖼️ Tournament Albums ({competition.picGroups?.length || 0})
				</button>
				<button 
					className={`nested-tab-btn ${activeSubTab === "teams" ? "active" : ""}`}
					onClick={() => setActiveSubTab("teams")}
				>
					👥 Teams & Standings ({competition.teams?.length || 0})
				</button>
			</div>

			<div className="nested-tab-content">
				{activeSubTab === "details" && (
					<div className="details-overview-tab">
						{competition.mainImageUrl && (
							<div className="banner-preview" style={{ marginBottom: "1rem" }}>
								<strong>Banner Photo:</strong>
								<img 
									src={competition.mainImageUrl} 
									alt="banner" 
									style={{ width: "100%", maxHeight: "150px", objectFit: "cover", borderRadius: "6px", display: "block", marginTop: "0.5rem", border: "1px solid rgba(255,255,255,0.1)" }} 
								/>
							</div>
						)}
						<p><strong>Dates:</strong> {competition.startDate?.toLocaleDateString()} {competition.endDate && `to ${competition.endDate?.toLocaleDateString()}`}</p>
						<p><strong>Venue:</strong> {competition.venue || "No venue listed"}</p>
						{competition.results && (
							<div className="results-summary">
								<strong>Results Summary:</strong>
								<pre>{competition.results}</pre>
							</div>
						)}
						<div className="content-summary">
							<strong>Content Excerpt:</strong>
							<p>{competition.content?.replace(/<[^>]+>/g, "").substring(0, 200)}...</p>
						</div>
					</div>
				)}

				{activeSubTab === "albums" && (
					<div className="albums-management-tab">
						<div className="add-album-form">
							<h4>Create New Album Group</h4>
							<div className="input-row">
								<input
									type="text"
									placeholder="e.g. Day 1 Action, Finals, Opening Ceremony..."
									value={newGroupTitle}
									onChange={(e) => setNewGroupTitle(e.target.value)}
								/>
								<button className="button" onClick={onAddGroup}>Add Album</button>
							</div>
						</div>

						<div className="albums-list-admin">
							{!competition.picGroups || competition.picGroups.length === 0 ? (
								<p>No albums created yet.</p>
							) : (
								competition.picGroups.map((group, gIdx) => (
									<div key={gIdx} className="admin-album-box">
										<div className="album-title-bar">
											<h5>{group.title}</h5>
											<button className="delete-album-btn" onClick={() => onDeleteGroup(group.title)}>Delete Album</button>
										</div>
										
										<div className="upload-photo-to-album">
											<h6>Upload Photo to this Album</h6>
											<div className="upload-row">
												<input
													type="text"
													placeholder="Photo Caption..."
													value={selectedTeamIdForGallery === `g-${gIdx}` ? newImageTitle : ""}
													onChange={(e) => {
														setSelectedTeamIdForGallery(`g-${gIdx}`);
														setNewImageTitle(e.target.value);
													}}
												/>
												<input
													type="file"
													id={`file-${competition.id}-${group.title.replace(/\s+/g, '')}`}
													onChange={(e) => setImageUpload(e.target.files[0])}
												/>
												<button 
													className="button"
													disabled={isUploading}
													onClick={() => onAddImageToGroup(group.title)}
												>
													{isUploading && selectedTeamIdForGallery === `g-${gIdx}` ? "Uploading..." : "Upload"}
												</button>
											</div>
										</div>

										<div className="album-pics-grid">
											{(group.pics || []).map((pic, pIdx) => (
												<div key={pIdx} className="admin-pic-thumb">
													<img src={pic.url} alt={pic.title} />
													<div className="pic-caption">{pic.title}</div>
													<button className="pic-delete" onClick={() => onDeletePic(group.title, pic.url)}>&times;</button>
												</div>
											))}
										</div>
									</div>
								))
							)}
						</div>
					</div>
				)}

				{activeSubTab === "teams" && (
					<div className="teams-management-tab">
						<form className="add-team-admin-form" onSubmit={onAddTeam}>
							<h4>Add Team to Competition</h4>
							<div className="form-grid">
								<div className="input-group">
									<label>Team Name *</label>
									<input
										type="text"
										placeholder="e.g. Kolkata Handball Club"
										value={teamName}
										required
										onChange={(e) => setTeamName(e.target.value)}
									/>
								</div>
								<div className="input-group">
									<label>Rank (Optional - for sorting list)</label>
									<input
										type="number"
										placeholder="e.g. 1"
										value={teamRank}
										onChange={(e) => setTeamRank(e.target.value)}
									/>
								</div>
								<div className="input-group">
									<label>Standing Text (Optional - e.g. '12 Pts')</label>
									<input
										type="text"
										placeholder="e.g. Won: 4, Lost: 1"
										value={teamStanding}
										onChange={(e) => setTeamStanding(e.target.value)}
									/>
								</div>
								<div className="input-group">
									<label>Upload Group Photo (Optional)</label>
									<input
										type="file"
										id={`squadPhoto-${competition.id}`}
										accept="image/*"
										onChange={(e) => setSquadPhoto(e.target.files[0])}
									/>
								</div>
								<div className="input-group full-width">
									<label>Additional Info (Optional - Players, Coach, etc.)</label>
									<textarea
										placeholder="Roster squad, coaches lists, or details..."
										rows="3"
										value={teamInfo}
										onChange={(e) => setTeamInfo(e.target.value)}
									/>
								</div>
							</div>
							<button className="button" type="submit" disabled={isUploading}>
								{isUploading ? "Uploading..." : "Add Team Profile"}
							</button>
						</form>

						<div className="teams-list-admin">
							<h4>Current Participating Teams</h4>
							{!competition.teams || competition.teams.length === 0 ? (
								<p>No teams added to this competition yet.</p>
							) : (
								competition.teams
									.sort((a,b) => (a.rank || 99) - (b.rank || 99))
									.map((team) => (
										<div key={team.id} className="admin-team-row">
											<div className="team-row-header">
												<div className="team-title-info">
													<h5>{team.name}</h5>
													<span className="team-rank-badge">Rank: {team.rank || "N/A"}</span>
													{team.standing && <span className="team-standing-badge">{team.standing}</span>}
												</div>
												<button className="delete-team-btn" onClick={() => onDeleteTeam(team.id)}>Remove Team</button>
											</div>

											<div className="team-assets-preview">
												{team.groupPhotoUrl && (
													<div className="team-squad-photo-preview">
														<span>Group Photo:</span>
														<img src={team.groupPhotoUrl} alt="squad" />
													</div>
												)}
												{team.additionalInfo && (
													<div className="team-info-preview">
														<span>Roster / Notes:</span>
														<pre>{team.additionalInfo}</pre>
													</div>
												)}
											</div>

											<div className="team-gallery-management">
												<h6>Manage Team Specific Action Gallery</h6>
												<div className="upload-row">
													<input
														type="text"
														placeholder="Action Pic Caption..."
														value={selectedTeamIdForGallery === team.id ? teamImageTitle : ""}
														onChange={(e) => {
															setSelectedTeamIdForGallery(team.id);
															setTeamImageTitle(e.target.value);
														}}
													/>
													<input
														type="file"
														id={`teampic-${competition.id}-${team.id}`}
														onChange={(e) => setTeamImageUpload(e.target.files[0])}
													/>
													<button 
														className="button"
														disabled={isUploading}
														onClick={() => onAddTeamPic(team.id)}
													>
														{isUploading && selectedTeamIdForGallery === team.id ? "Uploading..." : "Add Action Shot"}
													</button>
												</div>

												<div className="team-pics-grid">
													{(team.pics || []).map((pic, pIdx) => (
														<div key={pIdx} className="admin-pic-thumb">
															<img src={pic.url} alt={pic.title} />
															<div className="pic-caption">{pic.title}</div>
															<button className="pic-delete" onClick={() => onDeleteTeamPic(team.id, pic.url)}>&times;</button>
														</div>
													))}
												</div>
											</div>
										</div>
									))
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};