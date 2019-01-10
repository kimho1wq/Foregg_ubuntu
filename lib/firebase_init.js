//firebase
var firebase = require("firebase");
var config = {
    apiKey: "AIzaSyBK-JY3h8Hj4dH-qTJtTmmiew4zE8U9hC4",
    authDomain: "foregg-8e50f.firebaseapp.com",
    databaseURL: "https://foregg-8e50f.firebaseio.com",
    projectId: "foregg-8e50f",
    storageBucket: "foregg-8e50f.appspot.com",
    messagingSenderId: "530431911120"
};

firebase.initializeApp(config);

global.firebase = firebase;
global.firebaseAuth = firebase.auth();
global.firebaseDB = firebase.firestore();