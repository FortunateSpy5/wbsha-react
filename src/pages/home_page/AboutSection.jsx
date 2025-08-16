import React, { useEffect, useState } from "react";
import "../../styles/home/about-section.scss";
import Button from "../general/Button";
import { ref, getDownloadURL } from "firebase/storage";
import { storage } from "../../config/firebase";

const AboutSection = () => {
    const [imageUrl, setImageUrl] = useState("");

    useEffect(() => {
        // Check if the image URL is already cached in sessionStorage
        const cachedImageUrl = sessionStorage.getItem("home_about_image");
        if (cachedImageUrl) {
            setImageUrl(cachedImageUrl);
        } else {
            // Fetch the image URL from Firebase Storage
            const fetchImage = async () => {
                try {
                    const imageRef = ref(storage, "home_about.jpeg"); // Path to the image in Firebase Storage
                    const url = await getDownloadURL(imageRef);
                    setImageUrl(url);
                    // Cache the image URL in sessionStorage
                    sessionStorage.setItem("home_about_image", url);
                } catch (error) {
                    console.error("Error fetching image from Firebase Storage:", error);
                }
            };
            fetchImage();
        }
    }, []);

    return (
        <div className="about-section">
            <div className="content container">
                <div>
                    <div className="title">About Us</div>
                    <div className="text">
                        <p>
                            West Bengal State Handball Association (WBSHA) was
                            founded in 1973. It is affiliated to the Handball
                            Federation of India. The association has its
                            registered office in Kolkata. Handball has rapidly
                            spread throughout West Bengal and numerous districts
                            are actively participating in and promoting this
                            sport. The performance of the Bengal team, as well
                            as individual players, has been quite remarkable
                            since the inception of the game in the state in
                            1973.
                        </p>
                    </div>
                    <Button url="/about" text="Know More" />
                </div>
                <div className="image">
                    {imageUrl ? (
                        <img src={imageUrl} alt="home_about" />
                    ) : (
                        <p>Loading image...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AboutSection;
