// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyAWF7zjnLFM8g5aMtkXEljvMwaY3dEX6yU',
  authDomain: 'house-marketplace-app-d4bdd.firebaseapp.com',
  projectId: 'house-marketplace-app-d4bdd',
  storageBucket: 'house-marketplace-app-d4bdd.appspot.com',
  messagingSenderId: '308994277639',
  appId: '1:308994277639:web:e74090b5843f7bdbaa85a2',
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
