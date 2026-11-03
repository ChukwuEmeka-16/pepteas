"use client";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/firebase";
import {
  createContext,
  useContext,
  useEffect,
  useState
} from "react";
import { useRouter } from "next/navigation";
import {
  doc,
  onSnapshot,
  updateDoc
} from "firebase/firestore";

const AuthContext = createContext(null);

export default function AuthProvider({ children }: any) {
  const [userState, setUser] = useState({ email: "" } as any);
  const router = useRouter();

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(
      auth,
      (userObj) => {
        // Stop listening to the previous user's document.
        unsubscribeUserDoc?.();
        unsubscribeUserDoc = undefined;

        if (!userObj) {
          setUser({ email: "" });
          return;
        }

        // Listen continuously to the current user's document.
        const userRef = doc(db, "users", userObj.uid);

        unsubscribeUserDoc = onSnapshot(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              setUser({
                ...snapshot.data(),
                id: snapshot.id
              });
            } else {
              setUser({ email: "" });
            }
          },
          (error) => {
            console.error("Error listening to user document:", error);
          }
        );
      }
    );

    return () => {
      unsubscribeAuth();
      unsubscribeUserDoc?.();
    };
  }, []);

  // Synchronize the email field if Firebase Auth's email differs.
  useEffect(() => {
    const currentUser = auth.currentUser;

    if (
      currentUser?.uid &&
      currentUser.email &&
      userState?.email &&
      userState.email !== currentUser.email
    ) {
      const userRef = doc(db, "users", currentUser.uid);

      updateDoc(userRef, {
        email: currentUser.email
      }).catch((error) => {
        console.error("Error updating email in Firestore:", error);
      });
    }
  }, [userState]);

  return (
    <AuthContext.Provider value={{ userState } as any}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth: any = () => useContext(AuthContext);
