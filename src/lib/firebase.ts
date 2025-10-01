
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkXLQnQocsBbdVm2Fur-heXrzslGIPmew",
  authDomain: "gdgvtu-b2d9e.firebaseapp.com",
  projectId: "gdgvtu-b2d9e",
  storageBucket: "gdgvtu-b2d9e.firebasestorage.app",
  messagingSenderId: "1084661333737",
  appId: "1:1084661333737:web:d6342ec99b279fd0b4ba78",
  measurementId: "G-HL2TKL6409"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
