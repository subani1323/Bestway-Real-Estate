// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDyMnOeBiZ4maqoCbdTmA66arlCcfmbLuw",
  authDomain: "realestateapp-ef426.firebaseapp.com",
  projectId: "realestateapp-ef426",
  storageBucket: "realestateapp-ef426.firebasestorage.app",
  messagingSenderId: "868965069507",
  appId: "1:868965069507:web:c0c354d2addd2218e56876",
  measurementId: "G-X9MM7BFJME",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app); // <--- add Firestore initialization

export { auth, googleProvider, db }; // <--- export Firestore
