// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDHqdwCzSHW0JvoYXfEet-BE_kdoOsZdEo",
  authDomain: "maduraimesspos.firebaseapp.com",
  projectId: "maduraimesspos",
  storageBucket: "maduraimesspos.firebasestorage.app",
  messagingSenderId: "892062298968",
  appId: "1:892062298968:web:33d0792a08d8739307eb2d",
  measurementId: "G-6J8VF13727"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);