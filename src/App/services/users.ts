import {
  doc,
  query,
  where,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
} from "firebase/firestore";
import { User } from "@types";
import { db } from "./firebase";

export const COLLECTION_NAME = "users";

interface CreateUserArgs extends Omit<User, "displayName" | "isNewAcc"> {
  isNewAcc?: boolean;
  displayName?: string;
}
export const createUser = async ({
  firstName,
  lastName,
  ...user
}: CreateUserArgs) => {
  await setDoc(doc(db, COLLECTION_NAME, user.id), {
    photoURL: "",
    isNewAcc: true,
    displayName: `${firstName} ${lastName}`.trim(),
    ...user,
  });
};

type RemoveUserArgs = {
  userTypeID: string;
};
export const removeUser = async ({ userTypeID }: RemoveUserArgs) => {
  const usersSnapshot = await getDocs(
    query(
      collection(db, COLLECTION_NAME),
      where("userTypeID", "==", userTypeID)
    )
  );

  if (usersSnapshot?.docs?.[0]) {
    await deleteDoc(doc(db, COLLECTION_NAME, usersSnapshot.docs[0].id));
  } else {
    throw new Error("toast.default-error-desc");
  }
};
