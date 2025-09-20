// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA1FoKK-wAfLWT9Kbzx5ddrszHkwAKeiPY",
  authDomain: "ayurjeev-a42dc.firebaseapp.com",
  projectId: "ayurjeev-a42dc",
  storageBucket: "ayurjeev-a42dc.firebasestorage.app",
  messagingSenderId: "72665554338",
  appId: "1:72665554338:web:9ccb5df1d07e56e875e6fb",
  measurementId: "G-SNZD6FNBPW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
