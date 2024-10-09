import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBgKGDaixNQSxoq2B3VwP7PzrBAphDBdhA",
  authDomain: "business-launch-e30fb.firebaseapp.com",
  projectId: "business-launch-e30fb",
  storageBucket: "business-launch-e30fb.appspot.com",
  messagingSenderId: "413077581820",
  appId: "1:413077581820:web:b7b31242402aeedc404c79",
  measurementId: "G-203J0ZY48X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;