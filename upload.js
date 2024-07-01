// const {
//   query,
//   or,
//   where,
//   getDocs,
//   collection,
//   limit,
//   updateDoc,
//   doc,
//   orderBy,
//   writeBatch
// } = require('firebase/firestore/lite');
// const { initializeApp } = require('firebase/app');
// const { getFirestore } = require('firebase/firestore/lite');
// const fs = require('fs');
// const path = require('path');

// const data = JSON.parse(fs.readFileSync('data.json', { encoding: 'utf-8' }));

// const firebaseConfig = {
//   apiKey: 'AIzaSyDBn0iaQvIhMLPX79eVnRL_fN_EL3j4hhc',
//   authDomain: 'enso-collective.firebaseapp.com',
//   projectId: 'enso-collective',
//   storageBucket: 'enso-collective.appspot.com',
//   messagingSenderId: '166452691391',
//   appId: '1:166452691391:web:983f85a6beffb66c76a10a',
//   measurementId: 'G-WR1TERNN2W',
//   databaseURL: 'https://enso-collective-default-rtdb.firebaseio.com'
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);
// const proofCollection = collection(db, 'Proof');

// const batch = writeBatch(db);
// data.forEach((d) => {
//   const id = Math.random().toString().slice(0, 15) + Date.now();
//   const docRef = doc(db, 'Proof', id);
//   batch.set(docRef, { ...d, from: 'CLI' });
// });
// batch.commit().catch(console.log).then(console.log);
