import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: 'AIzaSyDBn0iaQvIhMLPX79eVnRL_fN_EL3j4hhc',
  authDomain: 'enso-collective.firebaseapp.com',
  databaseURL: 'https://enso-collective-default-rtdb.firebaseio.com',
  projectId: 'enso-collective',
  storageBucket: 'enso-collective.appspot.com',
  messagingSenderId: '166452691391',
  appId: '1:166452691391:web:983f85a6beffb66c76a10a',
  measurementId: 'G-WR1TERNN2W'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
