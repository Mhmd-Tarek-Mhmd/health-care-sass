import {
  doc,
  query,
  where,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  writeBatch,
} from "firebase/firestore";
import Store from "@store";
import { User } from "@types";
import { db } from "./firebase";
import { userTypes } from "@constants";

export const COLLECTION_NAME = "users";

interface CreateUserArgs
  extends Omit<
    User,
    "age" | "gender" | "userTypeID" | "isTempPassword" | "isActive" | "hospital"
  > {
  age?: string;
  gender?: string;
  userTypeID?: string;
}
export const createUser = async (user: CreateUserArgs) => {
  const isPatient = user?.type === userTypes.PATIENT;
  const hospitalID = Store.auth?.user?.hospital.id;
  await setDoc(doc(db, COLLECTION_NAME, user.id), {
    photoURL: "",
    isActive: true,
    isTempPassword: true,
    ...(isPatient ? { hospitals: [hospitalID] } : { hospitalID }),
    ...user,
  });
};

export type ToggleActiveStatusArgs = {
  id: string;
  collectionName: string;
};
export const toggleActiveStatus = async ({
  id,
  collectionName,
}: ToggleActiveStatusArgs) => {
  const usersSnapshot = await getDocs(
    query(collection(db, COLLECTION_NAME), where("userTypeID", "==", id))
  );
  const userDoc = usersSnapshot?.docs?.[0];

  if (userDoc?.id) {
    const batch = writeBatch(db);
    batch.update(doc(db, COLLECTION_NAME, userDoc.id), {
      isActive: !userDoc.data()?.isActive,
    });
    batch.update(doc(db, collectionName, id), {
      isActive: !userDoc.data()?.isActive,
    });
    await batch.commit();
  } else {
    throw new Error("toast.default-error-desc");
  }
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
