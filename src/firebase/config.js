import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDLK9QzB0CppEeQOjjyZeY3Kpbdd7-XsAA",
  authDomain: "yuhu5998.firebaseapp.com",
  databaseURL: "https://yuhu5998-default-rtdb.firebaseio.com",
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

// timestamp
const timestamp = firebase.firestore.Timestamp;

export { firebaseConfig, projectFirestore, projectAuth, timestamp };
