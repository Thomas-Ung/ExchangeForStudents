// BaseService.ts
import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    Firestore
  } from "firebase/firestore";
  import { db } from "../../firebaseConfig";
  
  export abstract class BaseService<T> {
    constructor(private collectionName: string) {}
  
    async create(item: T): Promise<string> {
      const docRef = await addDoc(collection(db, this.collectionName), item as any);
      return docRef.id;
    }
  
    async getAll(): Promise<T[]> {
      const snapshot = await getDocs(collection(db, this.collectionName));
      return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as T) }));
    }
  
    async getById(id: string): Promise<T | null> {
      const docRef = doc(db, this.collectionName, id);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...(snapshot.data() as T) };
      }
      return null;
    }
  
    async update(id: string, item: Partial<T>): Promise<void> {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, item);
    }
  
    async delete(id: string): Promise<void> {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    }
  }
  