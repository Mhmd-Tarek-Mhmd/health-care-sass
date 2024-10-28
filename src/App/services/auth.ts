import {
  deleteUser,
  updatePassword,
  User as AuthUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { createUser } from "./users";
import { db, auth } from "./firebase";
import { userTypes } from "@constants";
import { getHospital } from "./hospitals";
import { Auth, User, UserType } from "@types";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";

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
  if (!res.user) {
    throw new Error("toast.default-error-desc");
  }
  await createUser({ id: res.user.uid, createdAt: Timestamp.now(), ...args });
};

export type LogInArgs = {
  email: string;
  password: string;
};
export const login = async ({ email, password }: LogInArgs): Promise<Auth> => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const userDoc = await getDoc(doc(db, "users", res.user.uid));
  const userData = userDoc?.data();

  if (userData) {
    const isPatient = userData.type === userTypes.PATIENT;
    const hospital = await getHospital({ id: userData.hospitalID });
    const isHospitalActive = isPatient || hospital?.isActive;
    if (isHospitalActive && userData.isActive) {
      const token = await res.user.getIdToken();
      const user = {
        ...userData,
        ...(isPatient ? { hospitals: [hospital] } : { hospital }),
      } as User;
      return { token, user };
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
