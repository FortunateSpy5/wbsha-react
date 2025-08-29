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
	const [imageUpload, setImageUpload] = useState(null);
	const [newGroupTitle, setNewGroupTitle] = useState("");
	const [newImageTitle, setNewImageTitle] = useState("");
	const [editingCompetition, setEditingCompetition] = useState(null);

	const competitionsRef = collection(db, "competitions");

	useEffect(() => {
		const fetchCompetitions = async () => {
			try {
				const data = await getDocs(competitionsRef);
				const mappedData = data.docs.map((doc) => ({
					...doc.data(),
					id: doc.id,
					startDate: doc.data().startDate?.toDate(), // Convert Firestore Timestamp to Date
				}));
				setCompetitionsData(mappedData);
			} catch (error) {
				console.error("Error fetching competitions:", error);
			}
		};
		fetchCompetitions();
	}, [competitionsRef]);

	const schema = yup.object().shape({
		title: yup.string().required("Title is required"),
		startDate: yup.date().required("Start date is required"),
		content: yup.string().required("Content is required"),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm({
		resolver: yupResolver(schema),
	});

    const onAddGroup = async (competitionId) => {
    if (!newGroupTitle) {
        alert("Group title is required");
        return;
    }

    try {
        const competitionDoc = doc(db, "competitions", competitionId);
        const competition = competitionsData.find(
            (item) => item.id === competitionId
        );

        const updatedPicGroups = [
            ...(competition.picGroups || []),
            { title: newGroupTitle, pics: [] },
        ];

        const updatedCompetition = {
            ...competition,
            picGroups: updatedPicGroups,
        };

        await updateDoc(competitionDoc, updatedCompetition);

        setCompetitionsData((prev) =>
            prev.map((item) =>
                item.id === competitionId ? updatedCompetition : item
            )
        );
        setNewGroupTitle("");
    } catch (error) {
        console.error("Error adding group:", error);
    }
};

const onAddImageToGroup = async (competitionId, groupTitle) => {
    if (!imageUpload || !newImageTitle) {
        alert("Image and title are required");
        return;
    }

    try {
        const imageName = `${Date.now()}_${imageUpload.name}`;
        const storageRef = ref(storage, `competitions/${imageName}`);
        await uploadBytes(storageRef, imageUpload);
        const url = await getDownloadURL(storageRef);

        const competitionDoc = doc(db, "competitions", competitionId);
        const competition = competitionsData.find(
            (item) => item.id === competitionId
        );

        const updatedPicGroups = competition.picGroups.map((group) =>
            group.title === groupTitle
                ? {
                        ...group,
                        pics: [...(group.pics || []), { title: newImageTitle, url }],
                  }
                : group
        );

        const updatedCompetition = {
            ...competition,
            picGroups: updatedPicGroups,
        };

        await updateDoc(competitionDoc, updatedCompetition);

        setCompetitionsData((prev) =>
            prev.map((item) =>
                item.id === competitionId ? updatedCompetition : item
            )
        );
        setImageUpload(null);
        setNewImageTitle("");
    } catch (error) {
        console.error("Error adding image to group:", error);
    }
};

	const onAddOrUpdateCompetition = async (data) => {
		try {
			if (editingCompetition) {
				// Update competition
				const competitionDoc = doc(db, "competitions", editingCompetition.id);
				await updateDoc(competitionDoc, {
					...data,
					startDate: new Date(data.startDate),
				});
				setCompetitionsData((prev) =>
					prev.map((item) =>
						item.id === editingCompetition.id
							? { ...item, ...data, startDate: new Date(data.startDate) }
							: item
					)
				);
				setEditingCompetition(null);
			} else {
				// Add new competition
				const newCompetition = { ...data, picGroups: [] };
				const docRef = await addDoc(competitionsRef, newCompetition);
				setCompetitionsData((prev) => [
					...prev,
					{ ...newCompetition, id: docRef.id },
				]);
			}
			reset();
		} catch (error) {
			console.error("Error adding/updating competition:", error);
		}
	};

	const onDeleteCompetition = async (id) => {
		try {
			const competition = competitionsData.find((item) => item.id === id);

			// Recursively delete all pictures in storage
			for (const group of competition.picGroups || []) {
				for (const pic of group.pics || []) {
					const picRef = ref(storage, pic.url);
					await deleteObject(picRef);
				}
			}

			// Delete competition document
			await deleteDoc(doc(db, "competitions", id));
			setCompetitionsData((prev) =>
				prev.filter((competition) => competition.id !== id)
			);
		} catch (error) {
			console.error("Error deleting competition:", error);
		}
	};

	const onDeleteGroup = async (competitionId, groupTitle) => {
		try {
			const competitionDoc = doc(db, "competitions", competitionId);
			const competition = competitionsData.find(
				(item) => item.id === competitionId
			);

			// Find and delete all pictures in the group from storage
			const groupToDelete = competition.picGroups.find(
				(group) => group.title === groupTitle
			);
			for (const pic of groupToDelete.pics || []) {
				const picRef = ref(storage, pic.url);
				await deleteObject(picRef);
			}

			// Remove the group from Firestore
			const updatedPicGroups = competition.picGroups.filter(
				(group) => group.title !== groupTitle
			);

			const updatedCompetition = {
				...competition,
				picGroups: updatedPicGroups,
			};

			await updateDoc(competitionDoc, updatedCompetition);

			setCompetitionsData((prev) =>
				prev.map((item) =>
					item.id === competitionId ? updatedCompetition : item
				)
			);
		} catch (error) {
			console.error("Error deleting group:", error);
		}
	};

	const onDeletePic = async (competitionId, groupTitle, picUrl) => {
		try {
			const competitionDoc = doc(db, "competitions", competitionId);
			const competition = competitionsData.find(
				(item) => item.id === competitionId
			);

			// Delete the picture from storage
			const picRef = ref(storage, picUrl);
			await deleteObject(picRef);

			// Remove the picture from Firestore
			const updatedPicGroups = competition.picGroups.map((group) =>
				group.title === groupTitle
					? {
							...group,
							pics: group.pics.filter((pic) => pic.url !== picUrl),
					  }
					: group
			);

			const updatedCompetition = {
				...competition,
				picGroups: updatedPicGroups,
			};

			await updateDoc(competitionDoc, updatedCompetition);

			setCompetitionsData((prev) =>
				prev.map((item) =>
					item.id === competitionId ? updatedCompetition : item
				)
			);
		} catch (error) {
			console.error("Error deleting picture:", error);
		}
	};

	return (
		<div className="competitions-admin">
			<h2 className="competitions-admin-title page-heading">
				Manage Competitions
			</h2>
			<form
				className="competitions-admin-form"
				onSubmit={handleSubmit(onAddOrUpdateCompetition)}
			>
				<input
					className="competitions-admin-input"
					placeholder="Title..."
					{...register("title")}
					defaultValue={editingCompetition?.title || ""}
				/>
				<p className="competitions-admin-error">{errors.title?.message}</p>
				<input
					className="competitions-admin-input"
					type="date"
					placeholder="Start Date..."
					{...register("startDate")}
					defaultValue={
						editingCompetition?.startDate
							? editingCompetition.startDate.toISOString().split("T")[0]
							: ""
					}
				/>
				<p className="competitions-admin-error">{errors.startDate?.message}</p>
				<textarea
					className="competitions-admin-input"
					placeholder="Content..."
					{...register("content")}
					defaultValue={editingCompetition?.content || ""}
				/>
				<p className="competitions-admin-error">{errors.content?.message}</p>
				<input
					className="competitions-admin-submit button"
					type="submit"
					value={editingCompetition ? "Update Competition" : "Add Competition"}
				/>
			</form>
			<div className="competitions-list">
				{competitionsData.map((competition) => (
					<div key={competition.id} className="competition">
						<h3 className="competition-title">{competition.title}</h3>
						<p className="competition-start-date">
							Start Date: {competition.startDate?.toLocaleDateString()}
						</p>
						<div
							className="competition-content"
							dangerouslySetInnerHTML={{ __html: competition.content }}
						></div>
						<button
							className="competition-edit-btn"
							onClick={() => setEditingCompetition(competition)}
						>
							Edit
						</button>
						<button
							className="competition-delete-btn"
							onClick={() => onDeleteCompetition(competition.id)}
						>
							Delete
						</button>
						{/* Add Group */}
						<div className="add-group">
							<input
								type="text"
								placeholder="Group Title..."
								value={newGroupTitle}
								onChange={(e) => setNewGroupTitle(e.target.value)}
							/>
							<button
								className="add-group-btn"
								onClick={() => onAddGroup(competition.id)}
							>
								Add Group
							</button>
						</div>
						{/* Render picGroups */}
						{competition.picGroups.map((group, index) => (
							<div key={index} className="competition-pic-group">
								<h4 className="competition-pic-group-title">
									{group.title}
								</h4>
								<button
									className="delete-group-btn"
									onClick={() =>
										onDeleteGroup(competition.id, group.title)
									}
								>
									Delete Group
								</button>
								<div className="add-image">
									<input
										type="text"
										placeholder="Image Title..."
										value={newImageTitle}
										onChange={(e) => setNewImageTitle(e.target.value)}
									/>
									<input
										type="file"
										onChange={(e) => setImageUpload(e.target.files[0])}
									/>
									<button
										className="add-image-btn"
										onClick={() =>
											onAddImageToGroup(competition.id, group.title)
										}
									>
										Add Image
									</button>
								</div>
								<div className="competition-pics">
									{(group.pics || []).map((pic, picIndex) => (
										<div key={picIndex} className="competition-pic">
											<img
												src={pic.url}
												alt={pic.title}
												className="competition-pic-img"
											/>
											<p className="competition-pic-title">
												{pic.title}
											</p>
											<button
												className="delete-pic-btn"
												onClick={() =>
													onDeletePic(
														competition.id,
														group.title,
														pic.url
													)
												}
											>
												Delete Pic
											</button>
										</div>
									))}
								</div>
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
};