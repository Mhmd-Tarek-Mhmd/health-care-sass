import {
  deleteUser,
  updatePassword,
  User as AuthUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  ref,
  uploadBytes,
  deleteObject,
  getDownloadURL,
} from "firebase/storage";
import { createUser } from "./users";
import { userTypes } from "@constants";
import { getHospital } from "./hospitals";
import { Auth, Hospital, User, UserType } from "@types";
import { db, auth, storage } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { COLLECTION_NAME as USERS_COLLECTION_NAME } from "./users";

export type LogUpArgs = {
  name: string;
  type: UserType;
  userTypeID: string;
  email: string;
  phone?: string;
  password: string;
  isTempPassword?: boolean;
};
export const logUp = async ({ password, ...args }: LogUpArgs) => {
  const res = await createUserWithEmailAndPassword(auth, args?.email, password);
  if (!res?.user?.uid) {
    throw new Error("toast.default-error-desc");
  }
  await createUser({ id: res.user.uid, ...args });
};

export type LogInArgs = {
  email: string;
  password: string;
};
export const login = async ({ email, password }: LogInArgs): Promise<Auth> => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", res.user.uid));
  const user = userDoc?.data();
  if (user) {
    let hospital, hospitals;
    const isSuper = user.type === userTypes.SUPER;
    const isPatient = user.type === userTypes.PATIENT;

    if (isPatient) {
      const hospitalsPromises = user?.hospitals?.map((hospital: string) =>
        getHospital({ id: hospital })
      );
      hospitals = await Promise.all(hospitalsPromises);
    }
    if (!isSuper && !isPatient) {
      hospital = await getHospital({ id: user.hospitalID });
    }

    if (user.isActive) {
      const token = await res.user.getIdToken();
      return {
        token,
        user: { ...user, hospital, hospitals } as unknown as User,
      };
    } else {
      throw new Error("toast.auth/inactive");
    }
  } else {
    throw new Error("toast.auth/no-user");
  }
};

export const removeAuth = async () => {
  const user = auth.currentUser as AuthUser;
  await deleteUser(user);
};

export type ForgetPasswordArgs = {
  email: string;
};
export const forgetPassword = async ({ email }: ForgetPasswordArgs) => {
  const res = await sendPasswordResetEmail(auth, email);
  return res;
};

export type ResetPasswordArgs = {
  password: string;
};
export const resetPassword = async ({ password }: ResetPasswordArgs) => {
  const user = auth.currentUser as AuthUser;
  await Promise.all([
    updatePassword(user, password),
    updateDoc(doc(db, "users", user.uid), { isTempPassword: false }),
  ]);
};

export type UpdateProfileImageArgs = {
  image: File;
};
export const updateProfileImage = async ({ image }: UpdateProfileImageArgs) => {
  const user = auth.currentUser as AuthUser;
  const imageRef = ref(storage, `avatar/${user.uid}`);

  const snapshot = await uploadBytes(imageRef, image);
  const photoURL = await getDownloadURL(snapshot.ref);
  if (photoURL) {
    updateDoc(doc(db, USERS_COLLECTION_NAME, user.uid), { photoURL });
  }

  return photoURL;
};

export const clearProfileImage = async () => {
  const user = auth.currentUser as AuthUser;
  const imageRef = ref(storage, `avatar/${user.uid}`);
  await Promise.all([
    deleteObject(imageRef),
    updateDoc(doc(db, USERS_COLLECTION_NAME, user.uid), { photoURL: "" }),
  ]);
};
