// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvOy33j0GT9fIDVaa-3BVRNawJZ-uTDJc",
  authDomain: "pepteas.firebaseapp.com",
  projectId: "pepteas",
  storageBucket: "pepteas.firebasestorage.app",
  messagingSenderId: "563242020142",
  appId: "1:563242020142:web:a9ee7152b30da7aad61ebf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app)