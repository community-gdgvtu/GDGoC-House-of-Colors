// Import the functions you need from the SDKs you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
