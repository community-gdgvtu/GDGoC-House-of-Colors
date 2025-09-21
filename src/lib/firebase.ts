// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5vaSbiO0xmm4yD2oV4WzEBCoSNTv2Y10",
  authDomain: "gdgoc-vtu.firebaseapp.com",
  projectId: "gdgoc-vtu",
  storageBucket: "gdgoc-vtu.firebasestorage.app",
  messagingSenderId: "250512060184",
  appId: "1:250512060184:web:de337349a84c279068786d",
  measurementId: "G-VN23C6GSEG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
