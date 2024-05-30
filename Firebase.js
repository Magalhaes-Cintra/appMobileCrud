import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEBQYzbUGecylkhPm75hvkm3OWw5L9aP8",
  authDomain: "appfotosfs.firebaseapp.com",
  projectId: "appfotosfs",
  storageBucket: "appfotosfs.appspot.com",
  messagingSenderId: "230926654359",
  appId: "1:230926654359:web:1a1ece25faa1ee3d08c2d2"
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
export const fire = getFirestore(app);