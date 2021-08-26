import * as firebase from "firebase";
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

// const firebaseConfig = {
//     apiKey: process.env.API_KEY,
//     authDomain: process.env.AUTH_DOMAIN,
//     projectId: process.env.PROJECT_ID,
//     storageBucket: process.env.STORAGE_BUCKET,
//     messagingSenderId: process.env.MESSAGING_SENDER_ID,
//     appId: process.env.APP_ID
// }

// keys used to initialize app
var firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "reactfirebase-email-login.firebaseapp.com",
  projectId: "reactfirebase-email-login",
  storageBucket: "reactfirebase-email-login.appspot.com",
  messagingSenderId: "27633334858",
  appId: "1:27633334858:web:ad228739c2da930648c4b3"
};


// destructure imports
const firebaseApp = firebase.initializeApp(firebaseConfig);
export const auth = firebaseApp.auth;

