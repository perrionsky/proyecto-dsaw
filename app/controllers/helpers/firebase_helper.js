"use strict";

const firebase = require('firebase');
require('firebase/database');  // If you are using Firebase Realtime Database
require('firebase/firestore');  // If you are using Firestore



// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCrJyvq87obnym5fj4bga22V2AqrB3Lxe0",
  authDomain: "proyecto-dsaw.firebaseapp.com",
  databaseURL: "https://proyecto-dsaw-default-rtdb.firebaseio.com",
  projectId: "proyecto-dsaw",
  storageBucket: "proyecto-dsaw.appspot.com",
  messagingSenderId: "383124467139",
  appId: "1:383124467139:web:9e89b181b3b75313c22176",
  measurementId: "G-TMBZ5HYBC2"
};


firebase.initializeApp(firebaseConfig);

// Firebase Realtime Database
const database = firebase.database();

// Firestore
const firestore = firebase.firestore();

console.log("Hola MUndo");


function writeFirebase() {
  database.ref('Clients').set({
    hola: 'adios'
  });

  return true;
}

function setUserLoginData(userId, password) {
  console.log(userId);
  console.log(password);
  
  const userRef = database.ref('Clients/' + userId);
  userRef.once('value', snapshot => {
    if (!snapshot.exists()) {
      userRef.set({
        "username": userId,
        "password": password,
        "date_created": new Date().toISOString(),
        "posts": [
          {
            "title" : "Bienvenido a The Tech State",
            "summary" : "Este es un ejemplo de post para tu perfil",
            "description" : "This is supposed to be a long format desc",
            "section" : "Tech",
            "img_url" : "https://i.ibb.co/QcyzcTh/left-image.png",
            "comments" : [
              {
                "username" : "AndresQuiVal",
                "message" : "Hola, te acaba de comentar el admin! bienvenido a The Tech State!"
              }
            ]
          }
        ],
        "comments": [] // is not added but its supposed to!
      });

    }
  });

}



function getUserPosts(username, token) {
  return new Promise((resolve, reject) => {
      // Here, validate the token first (this part is just pseudocode)
      validateToken(token).then(isValid => {
          if (!isValid) {
              reject("Invalid token");
              return;
          }

          const postsRef = database.ref(`Clients/${username}/posts`);

          postsRef.once('value', snapshot => {
              if (snapshot.exists()) {
                  resolve(snapshot.val());
              } else {
                  resolve([]); // Return an empty array if there are no posts
              }
          }, error => {
              reject(error);
          });
      }).catch(error => {
          reject("Token validation failed");
      });
  });
}

function validateToken(username, token) {
  return new Promise((resolve, reject) => {
      const userRef = database.ref(`Clients/${username}/userTOKEN`);

      userRef.once('value', snapshot => {
        if (snapshot.exists()) {
            const userToken = snapshot.val(); 
            if (userToken === token) {
                resolve(true); 
            } else {
                resolve(false); 
            }
        } else {
            resolve(false); 
        }
      }).catch(error => {
          reject(error);
      });
  });
}


function setUserToken(userId, userToken) {
  const userRef = database.ref('users/' + userId); // Adjust path according to your database structure

  return userRef.update({
    userTOKEN: userToken
  })
  .then(() => {
    console.log('User token updated successfully.');
    return { success: true, message: 'Token updated' };
  })
  .catch(error => {
    console.error('Error updating user token:', error);
    return { success: false, message: 'Failed to update token', error: error };
  });
}

exports.writeFirebase = writeFirebase;
exports.setUserLoginData = setUserLoginData;
exports.setUserToken = setUserToken;
exports.getUserPosts = getUserPosts;


