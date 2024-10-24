import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  deleteDoc,
  collection,
  DocumentReference,
} from "firebase/firestore";
import { logUp } from "./auth";
import { db } from "./firebase";
import paginator from "./paginator";
import { PaginatorResponse, Hospital, Plan } from "@types";
import { COLLECTION_NAME as PLANS_COLLECTION_NAME } from "./plans";

const COLLECTION_NAME = "hospitals";

export interface GetHospitalsArgs {
  pageSize: number;
  pageNumber: number;
}
export const getHospitals = async ({
  pageSize,
  pageNumber,
}: GetHospitalsArgs): Promise<PaginatorResponse<Hospital>> => {
  const hospitals = await paginator<Hospital>({
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const hospitalsPromises = hospitals.items.map(async (hospital) => {
    const planDoc = await getDoc(
      hospital?.plan as unknown as DocumentReference
    );
    return {
      ...hospital,
      plan: { id: planDoc.id, ...planDoc?.data() } as Plan,
    };
  });

  const items = await Promise.all(hospitalsPromises);
  return { ...hospitals, items };
};

export interface GetHospitalArgs {
  id: string;
}

export const getHospital = async ({
  id,
}: GetHospitalArgs): Promise<Hospital> => {
  const docDoc = await getDoc(doc(db, COLLECTION_NAME, id));
  const planDoc = await getDoc(docDoc?.data()?.plan);
  const plan = { id: planDoc.id, ...planDoc?.data() } as Plan;
  return { id, ...docDoc?.data(), plan } as Hospital;
};

export const saveHospital = async ({
  plan,
  ...hospital
}: Hospital): Promise<void> => {
  const planDoc = await getDoc(
    doc(db, PLANS_COLLECTION_NAME, plan as unknown as string)
  );
  await addDoc(collection(db, COLLECTION_NAME), {
    ...hospital,
    plan: planDoc.ref,
    createdAt: Timestamp.now(),
  });
  await logUp({
    type: "admin",
    password: "123456",
    email: hospital?.email,
    firstName: hospital?.name,
    lastName: "",
  });
};

export const updateHospital = async ({
  id,
  plan,
  ...hospital
}: Hospital): Promise<void> => {
  const planDoc = await getDoc(
    doc(db, PLANS_COLLECTION_NAME, plan as unknown as string)
  );
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...hospital,
    plan: planDoc.ref,
    updatedAt: Timestamp.now(),
  });
};

export type RemoveHospitalArgs = {
  id: string;
};
export const removeHospital = async ({ id }: RemoveHospitalArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
