import React, { useEffect, useState } from "react";
import "../../styles/news/news-detail-modal.scss";

export const NewsDetailModal = ({ newsItem, onClose }) => {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!newsItem) return;
		const handleKeyDown = (e) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		const originalOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = originalOverflow;
		};
	}, [newsItem, onClose]);

	if (!newsItem) return null;

	const formattedDate = new Date(newsItem.date).toLocaleDateString(undefined, {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric"
	});

	const shareUrl = `${window.location.origin}/news?id=${newsItem.id}`;

	const handleCopyLink = () => {
		navigator.clipboard.writeText(shareUrl)
			.then(() => {
				setCopied(true);
				setTimeout(() => setCopied(false), 2000);
			})
			.catch((err) => {
				console.error("Failed to copy link: ", err);
			});
	};

	return (
		<div
			className="news-detail-modal-overlay"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-labelledby="news-modal-title"
		>
			<button
				className="modal-close-btn"
				onClick={onClose}
				aria-label="Close news modal"
			>
				&times;
			</button>
			<div className="modal-container" onClick={(e) => e.stopPropagation()}>
				<div className="modal-image-frame">
					<img src={newsItem.imageUrl} alt={newsItem.title} className="modal-image" />
				</div>
				<div className="modal-content">
					<div className="modal-date">📅 Published on: {formattedDate}</div>
					<h2 className="modal-title" id="news-modal-title">{newsItem.title}</h2>
					<div className="modal-body-text">{newsItem.content}</div>

					<div className="modal-share-panel">
						<span className="share-title">Share Article:</span>
						<div className="share-buttons">
							<button className="share-btn copy-btn" onClick={handleCopyLink}>
								{copied ? "✅ Copied!" : "🔗 Copy Link"}
							</button>
							<a 
								href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this news: ${newsItem.title} - ${shareUrl}`)}`} 
								target="_blank" 
								rel="noopener noreferrer" 
								className="share-btn whatsapp-btn"
							>
								💬 WhatsApp
							</a>
							<a 
								href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} 
								target="_blank" 
								rel="noopener noreferrer" 
								className="share-btn facebook-btn"
							>
								👥 Facebook
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
