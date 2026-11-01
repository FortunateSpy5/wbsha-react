/**
 * Utility to compress and resize image files before uploading to Firebase Storage.
 * This dramatically reduces bandwidth usage and storage costs.
 * 
 * Non-image files (such as PDFs or docs) pass through untouched.
 */
export const compressImage = async (file, options = {}) => {
	if (!file || !file.type || !file.type.startsWith("image/") || file.type === "image/svg+xml") {
		return file;
	}

	const {
		maxWidth = 1920,
		maxHeight = 1200,
		quality = 0.82,
		mimeType = "image/jpeg",
	} = options;

	return new Promise((resolve) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);

		reader.onload = (event) => {
			const img = new Image();
			img.src = event.target.result;

			img.onload = () => {
				let { width, height } = img;

				// Maintain aspect ratio while constraining to maxWidth / maxHeight
				if (width > maxWidth) {
					height = Math.round((height * maxWidth) / width);
					width = maxWidth;
				}
				if (height > maxHeight) {
					width = Math.round((width * maxHeight) / height);
					height = maxHeight;
				}

				const canvas = document.createElement("canvas");
				canvas.width = width;
				canvas.height = height;

				const ctx = canvas.getContext("2d");
				if (!ctx) {
					resolve(file);
					return;
				}

				// Fill white background in case of transparent PNG being converted to JPEG
				if (mimeType === "image/jpeg") {
					ctx.fillStyle = "#ffffff";
					ctx.fillRect(0, 0, width, height);
				}

				ctx.drawImage(img, 0, 0, width, height);

				canvas.toBlob(
					(blob) => {
						if (!blob || blob.size >= file.size) {
							// If compressed version is somehow larger, keep original
							resolve(file);
							return;
						}

						const extension = mimeType === "image/webp" ? ".webp" : mimeType === "image/jpeg" ? ".jpg" : "";
						let newName = file.name;
						if (extension && !newName.toLowerCase().endsWith(extension)) {
							newName = newName.replace(/\.[^/.]+$/, "") + extension;
						}

						const compressedFile = new File([blob], newName, {
							type: mimeType,
							lastModified: Date.now(),
						});

						resolve(compressedFile);
					},
					mimeType,
					quality
				);
			};

			img.onerror = () => resolve(file);
		};

		reader.onerror = () => resolve(file);
	});
};

/**
 * Standard Firebase Storage cache-control metadata for long-term browser & CDN caching.
 */
export const STORAGE_CACHE_METADATA = {
	cacheControl: "public, max-age=31536000, immutable",
};
