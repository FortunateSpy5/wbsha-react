import { ref, listAll, updateMetadata, getMetadata } from "firebase/storage";
import { storage } from "../config/firebase";

/**
 * Traverses Firebase Storage directories and sets long-term public caching headers
 * on all existing files that are missing them.
 * 
 * @param {Function} onProgress - Optional callback(count, fileName)
 * @returns {Promise<number>} - Count of updated files
 */
export const optimizeExistingStorageFiles = async (onProgress) => {
	const directories = [
		"heroes",
		"media",
		"news",
		"competitions/banners",
		"competitions/albums",
		"competitions/teams/squads",
		"competitions/teams/pics",
		"about/members",
		"announcements",
		"documents",
		"education",
	];

	let totalUpdated = 0;

	for (const dir of directories) {
		try {
			const dirRef = ref(storage, dir);
			const result = await listAll(dirRef);

			for (const itemRef of result.items) {
				try {
					const currentMeta = await getMetadata(itemRef);
					if (
						!currentMeta.cacheControl ||
						!currentMeta.cacheControl.includes("max-age=31536000")
					) {
						await updateMetadata(itemRef, {
							cacheControl: "public, max-age=31536000, immutable",
						});
						totalUpdated++;
						if (onProgress) {
							onProgress(totalUpdated, itemRef.name);
						}
					}
				} catch (fileErr) {
					console.warn(`Skipping metadata update for ${itemRef.fullPath}:`, fileErr);
				}
			}
		} catch (dirErr) {
			console.warn(`Could not list directory ${dir}:`, dirErr);
		}
	}

	return totalUpdated;
};
