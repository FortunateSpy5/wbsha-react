// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
	apiKey: "AIzaSyD4OaHUYWfUE_SWS0cznatqQhZBCekZ_Lk",
	authDomain: "wbsha-f8e09.firebaseapp.com",
	projectId: "wbsha-f8e09",
	storageBucket: "wbsha-f8e09.appspot.com",
	messagingSenderId: "417527512603",
	appId: "1:417527512603:web:71480ebfaa016c09fd82be",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
