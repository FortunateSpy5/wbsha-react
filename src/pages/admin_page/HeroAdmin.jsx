import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
	addDoc,
	collection,
	getDocs,
	deleteDoc,
	doc,
} from "firebase/firestore";
import { db, storage } from "../../config/firebase";
import { useState } from "react";
import {
	ref,
	uploadBytes,
	getDownloadURL,
	deleteObject,
} from "firebase/storage";

export const HeroAdmin = () => {
	const [imageUpload, setImageUpload] = useState(null);
	const [imageUploadError, setImageUploadError] = useState(null);
	const [heroData, setHeroData] = useState([]);

	const heroRef = collection(db, "heroes");

	useEffect(() => {
		const getHero = async () => {
			const data = await getDocs(heroRef);
			// get the name of the document and add it to the data object
			const mappedData = data.docs.map((doc) => {
				return { ...doc.data(), id: doc.id };
			});
			const sortedData = mappedData.sort((a, b) => {
				return a.order - b.order;
			});
			setHeroData(sortedData);
		};
		getHero();
	}, []);

	const schema = yup.object().shape({
		title: yup.string().required("Title is required"),
		description: yup.string().required("Description is required"),
		order: yup
			.number()
			.integer("Order must be a whole number")
			.required("Order is required"),
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});

	const heroesRef = collection(db, "heroes");

	const onAddHero = (data) => {
		data.createdAt = new Date();
		if (imageUpload) {
			// add timestamp to image name
			const imageName = `${Date.now()}_${imageUpload.name}`;
			const storageRef = ref(storage, `heroes/${imageName}`);
			uploadBytes(storageRef, imageUpload)
				.then((snapshot) => {
					getDownloadURL(snapshot.ref).then((url) => {
						data.url = url;
						addDoc(heroesRef, data)
							.then(() => {
								console.log("Document successfully added!");
							})
							.catch((error) => {
								console.error("Error adding document: ", error);
							});
					});
				})
				.catch((error) => {
					console.log(error.message);
				});
		} else {
			setImageUploadError("Image is required");
		}
	};

	// function to delete hero from collection and remove image from storage
	const onDeleteHero = (id, url) => {
		// delete image from storage
		const imageName = url.split("%2F")[1].split("?")[0];
		url = `heroes/${imageName}`;
		const storageRef = ref(storage, url);
		deleteObject(storageRef)
			.then(() => {
				console.log("Image successfully deleted!");
			})
			.catch((error) => {
				console.error("Error removing image: ", error);
			});

		// delete hero from collection
		console.log(id);
		deleteDoc(doc(db, "heroes", id))
			.then(() => {
				console.log("Document successfully deleted!");
			})
			.catch((error) => {
				console.error("Error removing document: ", error);
			});
	};

	return (
		<div className="hero-admin">
			<h2>Add Hero</h2>
			<form onSubmit={handleSubmit(onAddHero)}>
				<input placeholder="Title..." {...register("title")} />
				<p>{errors.title?.message}</p>
				<input
					placeholder="Description..."
					{...register("description")}
				/>
				<p>{errors.description?.message}</p>
				<input placeholder="Order..." {...register("order")} />
				<p>{errors.order?.message}</p>
				<p>{errors.url?.message}</p>
				<input
					type="file"
					onChange={(event) => setImageUpload(event.target.files[0])}
				/>
				{imageUploadError && <p>{imageUploadError}</p>}
				<input type="submit" />
			</form>
			<h2>Current Heroes</h2>
			<div className="hero-list">
				{heroData.map((hero) => {
					return (
						<div key={hero.id} className="hero">
							<img src={hero.url} alt={hero.title} />
							<div className="hero-info">
								<h3>{hero.title}</h3>
								<p>{hero.description}</p>
								<p>{hero.order}</p>
								<button
									onClick={() =>
										onDeleteHero(hero.id, hero.url)
									}
								>
									Delete
								</button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};
