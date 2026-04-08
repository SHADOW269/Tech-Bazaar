
import { initializeFirebase } from "@/firebase";
import { getStorage } from "firebase/storage";

const { auth, firestore: db, firebaseApp: app } = initializeFirebase();
const storage = getStorage(app);

export { auth, db, storage };
