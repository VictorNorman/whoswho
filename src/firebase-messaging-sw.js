importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
    apiKey: 'AIzaSyCMZN9f0sB2FSXWfkT7PnJFntRUYaR-Mbc',
    authDomain: 'vtn2-whoswho.firebaseapp.com',
    projectId: 'vtn2-whoswho',
    storageBucket: 'vtn2-whoswho.appspot.com',
    messagingSenderId: '909733348055',
    appId: '1:909733348055:web:bfc2b3eb8de22b647fa692',
    measurementId: 'G-S41MY9LVY7'
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
messaging = firebase.messaging();
