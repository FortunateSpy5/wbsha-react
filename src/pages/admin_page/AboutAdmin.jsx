import React, { useEffect, useState } from "react";
import { db, storage } from "../../config/firebase";
import {
	collection,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	doc,
} from "firebase/firestore";
import {
	ref,
	uploadBytes,
	getDownloadURL,
	deleteObject,
} from "firebase/storage";
import "../../styles/admin/about-admin.scss";

export const AboutAdmin = () => {
	const [sections, setSections] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [successMessage, setSuccessMessage] = useState(null);

	// Section form state
	const [editingSection, setEditingSection] = useState(null);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [type, setType] = useState("text");
	const [order, setOrder] = useState(0);
	const [members, setMembers] = useState([]);

	// Member form state (for adding/editing a member within a section)
	const [isMemberFormOpen, setIsMemberFormOpen] = useState(false);
	const [editingMemberIndex, setEditingMemberIndex] = useState(null);
	const [memberName, setMemberName] = useState("");
	const [memberRole, setMemberRole] = useState("");
	const [memberBio, setMemberBio] = useState("");
	const [memberOrder, setMemberOrder] = useState(0);
	const [memberImageFile, setMemberImageFile] = useState(null);
	const [memberImageUrl, setMemberImageUrl] = useState("");
	const [uploadingMemberImage, setUploadingMemberImage] = useState(false);

	const sectionsRef = collection(db, "aboutSections");

	const fetchSections = async () => {
		setLoading(true);
		try {
			const data = await getDocs(sectionsRef);
			const mapped = data.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}));
			// Sort sections by order
			mapped.sort((a, b) => (a.order || 0) - (b.order || 0));
			setSections(mapped);
		} catch (error) {
			console.error("Error fetching about sections:", error);
		}
		setLoading(false);
	};

	useEffect(() => {
		fetchSections();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const resetSectionForm = () => {
		setEditingSection(null);
		setTitle("");
		setDescription("");
		setType("text");
		setOrder(0);
		setMembers([]);
		closeMemberForm();
	};

	const closeMemberForm = () => {
		setIsMemberFormOpen(false);
		setEditingMemberIndex(null);
		setMemberName("");
		setMemberRole("");
		setMemberBio("");
		setMemberOrder(0);
		setMemberImageFile(null);
		setMemberImageUrl("");
	};

	const handleEditSection = (section) => {
		setEditingSection(section);
		setTitle(section.title || "");
		setDescription(section.description || "");
		setType(section.type || "text");
		setOrder(section.order || 0);
		setMembers(section.members || []);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleAddMemberClick = () => {
		closeMemberForm();
		setIsMemberFormOpen(true);
	};

	const handleEditMemberClick = (index) => {
		const m = members[index];
		setEditingMemberIndex(index);
		setMemberName(m.name || "");
		setMemberRole(m.role || "");
		setMemberBio(m.description || "");
		setMemberOrder(m.order || 0);
		setMemberImageUrl(m.pictureUrl || "");
		setIsMemberFormOpen(true);
	};

	const handleMemberImageChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			setMemberImageFile(e.target.files[0]);
		}
	};

	const handleSaveMember = async (e) => {
		e.preventDefault();
		if (!memberName) {
			alert("Member Name is required.");
			return;
		}

		setUploadingMemberImage(true);
		try {
			let finalImageUrl = memberImageUrl;

			if (memberImageFile) {
				// Upload new image
				const fileName = `${Date.now()}_${memberImageFile.name}`;
				const storageRef = ref(storage, `about/members/${fileName}`);
				await uploadBytes(storageRef, memberImageFile);
				finalImageUrl = await getDownloadURL(storageRef);

				// If editing and had a previous picture, we could delete it, but for safety we can proceed
				if (editingMemberIndex !== null && members[editingMemberIndex]?.pictureUrl) {
					const oldUrl = members[editingMemberIndex].pictureUrl;
					if (oldUrl.includes("firebasestorage.googleapis.com")) {
						const decodedUrl = decodeURIComponent(oldUrl);
						const parts = decodedUrl.split("/o/");
						if (parts.length > 1) {
							const filePath = parts[1].split("?")[0];
							await deleteObject(ref(storage, filePath)).catch((err) =>
								console.warn("Could not delete old member photo:", err)
							);
						}
					}
				}
			}

			const newMemberObj = {
				id: editingMemberIndex !== null ? members[editingMemberIndex].id : `mem_${Date.now()}`,
				name: memberName,
				role: memberRole,
				description: memberBio,
				pictureUrl: finalImageUrl,
				order: Number(memberOrder) || 0,
			};

			let updatedMembers = [...members];
			if (editingMemberIndex !== null) {
				updatedMembers[editingMemberIndex] = newMemberObj;
			} else {
				updatedMembers.push(newMemberObj);
			}

			// Sort members inside the section by order
			updatedMembers.sort((a, b) => (a.order || 0) - (b.order || 0));

			setMembers(updatedMembers);
			closeMemberForm();
		} catch (error) {
			console.error("Error saving member details:", error);
			alert("Failed to save member details. Please try again.");
		}
		setUploadingMemberImage(false);
	};

	const handleDeleteMember = async (index) => {
		if (!window.confirm("Are you sure you want to delete this member?")) return;

		const m = members[index];
		if (m.pictureUrl && m.pictureUrl.includes("firebasestorage.googleapis.com")) {
			// Delete image from storage
			const decodedUrl = decodeURIComponent(m.pictureUrl);
			const parts = decodedUrl.split("/o/");
			if (parts.length > 1) {
				const filePath = parts[1].split("?")[0];
				await deleteObject(ref(storage, filePath)).catch((err) =>
					console.warn("Could not delete old member image:", err)
				);
			}
		}

		const updated = members.filter((_, idx) => idx !== index);
		setMembers(updated);
	};

	const handleSaveSection = async (e) => {
		e.preventDefault();
		if (!title) {
			alert("Section Title is required.");
			return;
		}

		setIsSubmitting(true);
		try {
			const preparedData = {
				title,
				description,
				type,
				order: Number(order) || 0,
				members: type === "members" ? members : [],
				updatedAt: new Date(),
			};

			if (editingSection) {
				const sectionDoc = doc(db, "aboutSections", editingSection.id);
				await updateDoc(sectionDoc, preparedData);
				setSuccessMessage(`About section "${title}" updated successfully!`);
			} else {
				preparedData.createdAt = new Date();
				await addDoc(sectionsRef, preparedData);
				setSuccessMessage(`About section "${title}" created successfully!`);
			}
			setTimeout(() => {
				setSuccessMessage(null);
			}, 4000);

			resetSectionForm();
			fetchSections();
		} catch (error) {
			console.error("Error saving section:", error);
			alert("Failed to save section. Please try again.");
		}
		setIsSubmitting(false);
	};

	const handleDeleteSection = async (section) => {
		if (!window.confirm(`Are you sure you want to delete the section "${section.title}"?`)) return;

		setLoading(true);
		try {
			// If it's a members section, clean up all storage pictures first
			if (section.members && section.members.length > 0) {
				await Promise.all(
					section.members.map(async (m) => {
						if (m.pictureUrl && m.pictureUrl.includes("firebasestorage.googleapis.com")) {
							const decodedUrl = decodeURIComponent(m.pictureUrl);
							const parts = decodedUrl.split("/o/");
							if (parts.length > 1) {
								const filePath = parts[1].split("?")[0];
								await deleteObject(ref(storage, filePath)).catch((err) =>
									console.warn("Image not found in storage while deleting section member:", err)
								);
							}
						}
					})
				);
			}

			await deleteDoc(doc(db, "aboutSections", section.id));
			fetchSections();
		} catch (error) {
			console.error("Error deleting section:", error);
			alert("Failed to delete section.");
		}
		setLoading(false);
	};

	return (
		<div className="about-admin">
			<h2 className="about-admin-title page-heading">
				{editingSection ? "Edit About Section" : "Add About Section"}
			</h2>

			{successMessage && (
				<div className="admin-success-banner" style={{
					background: "#d1fae5",
					color: "#065f46",
					padding: "1rem",
					borderRadius: "4px",
					marginBottom: "1.5rem",
					fontWeight: "600",
					border: "1px solid #a7f3d0"
				}}>
					✅ {successMessage}
				</div>
			)}

			<form className="about-admin-form" onSubmit={handleSaveSection}>
				<div className="form-group-row">
					<div className="form-group">
						<label htmlFor="sec-title">Section Title</label>
						<input
							id="sec-title"
							className="about-admin-input"
							placeholder="e.g. Governing Body, Our Mission..."
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>
					<div className="form-group">
						<label htmlFor="sec-order">Display Order (Ascending)</label>
						<input
							id="sec-order"
							type="number"
							className="about-admin-input"
							value={order}
							onChange={(e) => setOrder(e.target.value)}
						/>
					</div>
				</div>

				<div className="form-group">
					<label htmlFor="sec-type">Section Type / Layout</label>
					<select
						id="sec-type"
						className="about-admin-input"
						value={type}
						onChange={(e) => setType(e.target.value)}
					>
						<option value="text">📄 Text / Description Only</option>
						<option value="members">👥 Members / Governing Body Grid</option>
					</select>
				</div>

				<div className="form-group">
					<label htmlFor="sec-desc">Description / Introduction Text</label>
					<textarea
						id="sec-desc"
						className="about-admin-input about-admin-textarea"
						placeholder="Introduce the section, write paragraphs here..."
						rows="4"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
					/>
				</div>

				{/* Members List Sub-editor */}
				{type === "members" && (
					<div className="members-sub-editor">
						<div className="members-header">
							<h4>Section Members ({members.length})</h4>
							<button
								type="button"
								className="add-member-btn button"
								onClick={handleAddMemberClick}
							>
								+ Add Member
							</button>
						</div>

						{/* Member Form Modal / Panel */}
						{isMemberFormOpen && (
							<div className="member-form-panel">
								<h5>{editingMemberIndex !== null ? "Edit Member" : "Add New Member"}</h5>
								<div className="member-form">
									<div className="form-group-row">
										<div className="form-group">
											<label>Full Name *</label>
											<input
												type="text"
												className="about-admin-input"
												value={memberName}
												onChange={(e) => setMemberName(e.target.value)}
												placeholder="e.g. John Doe"
												required
											/>
										</div>
										<div className="form-group">
											<label>Designation / Role</label>
											<input
												type="text"
												className="about-admin-input"
												value={memberRole}
												onChange={(e) => setMemberRole(e.target.value)}
												placeholder="e.g. Vice President"
											/>
										</div>
									</div>

									<div className="form-group-row">
										<div className="form-group">
											<label>Member Picture</label>
											<input
												type="file"
												accept="image/*"
												onChange={handleMemberImageChange}
											/>
											{memberImageUrl && (
												<div className="member-img-preview">
													<img src={memberImageUrl} alt="Preview" />
													<span>Current Image</span>
												</div>
											)}
										</div>
										<div className="form-group">
											<label>Display Order</label>
											<input
												type="number"
												className="about-admin-input"
												value={memberOrder}
												onChange={(e) => setMemberOrder(e.target.value)}
											/>
										</div>
									</div>

									<div className="form-group">
										<label>Description / Bio</label>
										<textarea
											className="about-admin-input"
											rows="2"
											value={memberBio}
											onChange={(e) => setMemberBio(e.target.value)}
											placeholder="Brief bio or details about the member..."
										/>
									</div>

									<div className="member-form-actions">
										<button
											type="button"
											className="cancel-member-btn button button-secondary"
											onClick={closeMemberForm}
											disabled={uploadingMemberImage}
										>
											Cancel
										</button>
										<button
											type="button"
											className="save-member-btn button"
											onClick={handleSaveMember}
											disabled={uploadingMemberImage}
										>
											{uploadingMemberImage ? "Uploading Photo..." : "Save Member"}
										</button>
									</div>
								</div>
							</div>
						)}

						{/* Display Members Grid in Admin */}
						<div className="members-admin-list">
							{members.length === 0 ? (
								<p className="no-members-text">No members added yet. Click "+ Add Member" to begin.</p>
							) : (
								<div className="members-admin-grid">
									{members.map((m, idx) => (
										<div key={m.id || idx} className="member-admin-card">
											<div className="member-img-container">
												{m.pictureUrl ? (
													<img src={m.pictureUrl} alt={m.name} />
												) : (
													<div className="img-placeholder">No Pic</div>
												)}
											</div>
											<div className="member-info">
												<div className="member-name">{m.name}</div>
												{m.role && <div className="member-role">{m.role}</div>}
												<div className="member-order">Order: {m.order}</div>
											</div>
											<div className="member-actions">
												<button
													type="button"
													className="member-btn edit"
													onClick={() => handleEditMemberClick(idx)}
												>
													Edit
												</button>
												<button
													type="button"
													className="member-btn delete"
													onClick={() => handleDeleteMember(idx)}
												>
													Delete
												</button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				)}

				<div className="form-actions" style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", width: "100%" }}>
					{editingSection && (
						<button
							type="button"
							className="cancel-btn button button-secondary"
							onClick={resetSectionForm}
							disabled={isSubmitting}
							style={{ padding: "0.75rem 1.5rem" }}
						>
							Cancel Edit
						</button>
					)}
					<button
						type="submit"
						className="submit-btn button"
						disabled={isSubmitting}
						style={{ flexGrow: 1 }}
					>
						{isSubmitting ? "Saving Section..." : editingSection ? "Update Section" : "Add Section"}
					</button>
				</div>
			</form>

			<h2 className="about-admin-title page-heading">Existing About Sections</h2>
			{loading ? (
				<p>Loading sections...</p>
			) : sections.length === 0 ? (
				<p>No custom sections found.</p>
			) : (
				<div className="sections-list">
					{sections.map((sec) => (
						<div key={sec.id} className="section-item">
							<div className="section-info">
								<h3 className="section-title">
									{sec.title}
									<span className="section-badge">
										{sec.type === "members" ? "👥 Members List" : "📄 Text Layout"}
									</span>
									<span className="order-badge">Order: {sec.order}</span>
								</h3>
								{sec.description && (
									<p className="section-desc-excerpt">
										{sec.description.length > 150
											? `${sec.description.substring(0, 150)}...`
											: sec.description}
									</p>
								)}
								{sec.type === "members" && sec.members && (
									<div className="section-members-count">
										Members: {sec.members.length}
									</div>
								)}
							</div>
							<div className="section-item-actions">
								<button
									className="section-action-btn edit"
									onClick={() => handleEditSection(sec)}
								>
									Edit
								</button>
								<button
									className="section-action-btn delete"
									onClick={() => handleDeleteSection(sec)}
								>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};
