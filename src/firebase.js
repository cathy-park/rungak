import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDtarOBaPtryZTYQOp3XIGHYq-XyfoHBHM",
  authDomain: "rungak-ad6fe.firebaseapp.com",
  projectId: "rungak-ad6fe",
  storageBucket: "rungak-ad6fe.appspot.com",
  messagingSenderId: "645464823838",
  appId: "1:645464823838:web:6946d293a228578d00e06a",
  measurementId: "G-JFDJ801F6G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, doc, setDoc, getDoc };
