import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { Auth, User } from "@types";
import { db, auth } from "./firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";

export type LogUpArgs = {
  type: string;
  email: string;
  password: string;
  lastName: string;
  firstName: string;
};
export const logUp = async ({ email, password, ...args }: LogUpArgs) => {
  const res = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "users", res.user.uid), {
    photoURL: "",
    id: res.user.uid,
    displayName: `${args.firstName} ${args?.lastName}`.trim(),
    ...args,
  });
};

export type LogInArgs = {
  email: string;
  password: string;
};
export const login = async ({ email, password }: LogInArgs): Promise<Auth> => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const userRes = await getDoc(doc(db, "users", res.user.uid));
  const token = await res.user.getIdToken();
  const user = userRes?.data() as User;
  return { token, user };
};

export type ForgetPasswordArgs = {
  email: string;
};
export const forgetPassword = async ({ email }: ForgetPasswordArgs) => {
  const res = await sendPasswordResetEmail(auth, email);
  return res;
};
