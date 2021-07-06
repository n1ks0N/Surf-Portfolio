import firebase from 'firebase/app';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDEQDP3xLev5gcSGhwtVj3TjPOJdXXFh74",
  authDomain: "surfing-aad2d.firebaseapp.com",
  projectId: "surfing-aad2d",
  storageBucket: "surfing-aad2d.appspot.com",
  messagingSenderId: "652054854634",
  appId: "1:652054854634:web:24b60a7c6f0c694e031093",
  measurementId: "G-NSXDLDNNQ3"
};

// Initialize Firebase
export const fb = firebase.initializeApp(firebaseConfig);
