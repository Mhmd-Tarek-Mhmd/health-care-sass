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
import { Auth, User, UserType } from "@types";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export type LogUpArgs = {
  type: UserType;
  userTypeID: string;
  email: string;
  password: string;
  lastName: string;
  firstName: string;
};
export const logUp = async ({ email, password, ...args }: LogUpArgs) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  if (!res.user) {
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
  const userRes = await getDoc(doc(db, "users", res.user.uid));
  if (userRes.data()) {
    const token = await res.user.getIdToken();
    const user = userRes?.data() as User;
    return { token, user };
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
    updateDoc(doc(db, "users", user.uid), { isNewAcc: false }),
  ]);
};
