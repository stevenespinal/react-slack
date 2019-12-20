import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/database";

//for storing media files, etc
import "firebase/storage";

let firebaseConfig = {
  apiKey: "AIzaSyAjKQ7jKThIluZ1xOjjfSyNGmFpD9oxHik",
  authDomain: "react-slack-5db85.firebaseapp.com",
  databaseURL: "https://react-slack-5db85.firebaseio.com",
  projectId: "react-slack-5db85",
  storageBucket: "react-slack-5db85.appspot.com",
  messagingSenderId: "1014043650073",
  appId: "1:1014043650073:web:b29f4003546063577de288",
  measurementId: "G-566F3CR8WV"
};

firebase.initializeApp(firebaseConfig);


export default firebase;