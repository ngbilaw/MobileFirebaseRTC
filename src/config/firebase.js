import firebase from "firebase/app";
import "firebase/firestore";

var config = {
    apiKey: "AIzaSyDJJO10oU7Tl7rtc-vZpMHKiGdvBsHcHIc",
    authDomain: "mobilefirebasertc.firebaseapp.com",
    databaseURL: "https://mobilefirebasertc.firebaseio.com",
    projectId: "mobilefirebasertc",
    storageBucket: "mobilefirebasertc.appspot.com",
    messagingSenderId: "891585296824",
    appId: "1:891585296824:web:7e13a9ac9e0fcc0609b74d",
    measurementId: "G-3GZGXG7EKJ"
  };

firebase.initializeApp(config);

export const firestore = firebase.firestore()
export default firebase;
