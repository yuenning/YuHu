import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyDLK9QzB0CppEeQOjjyZeY3Kpbdd7-XsAA",
  authDomain: "yuhu5998.firebaseapp.com",
  projectId: "yuhu5998",
  storageBucket: "yuhu5998.appspot.com",
  messagingSenderId: "142613113769",
  appId: "1:142613113769:web:e4566b08a2d60ac782f2b8",
  measurementId: "G-MPPG5QXYK9",
};

// init firebase
firebase.initializeApp(firebaseConfig);

// init services
const projectFirestore = firebase.firestore();
const projectAuth = firebase.auth();

export { projectFirestore, projectAuth };
