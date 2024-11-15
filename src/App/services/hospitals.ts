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
import { userTypes } from "@constants";
import { removeUser, toggleActiveStatus } from "./users";
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
  const hospitalsPromises = hospitals.items.map((hospital) =>
    getHospital({ id: hospital.id })
  );

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
  const planDoc = await getDoc(docDoc?.data()?.plan as DocumentReference);
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
  const newDoc = await addDoc(collection(db, COLLECTION_NAME), {
    ...hospital,
    isActive: true,
    plan: planDoc.ref,
    createdAt: Timestamp.now(),
  });

  if (!newDoc.id) {
    throw new Error("toast.default-error-desc");
  }

  try {
    await logUp({
      type: userTypes.ADMIN,
      userTypeID: newDoc.id,
      password: "123456",
      email: hospital?.email,
      phone: hospital?.phone,
      name: hospital?.name,
    });
  } catch (error) {
    await deleteDoc(doc(db, COLLECTION_NAME, newDoc.id));
    throw new Error("toast.default-error-desc");
  }
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

export type ToggleHospitalStatusArgs = {
  id: string;
};
export const toggleHospitalStatus = async ({
  id,
}: ToggleHospitalStatusArgs) => {
  await toggleActiveStatus({ id, collectionName: COLLECTION_NAME });
};

export type RemoveHospitalArgs = {
  id: string;
};
export const removeHospital = async ({ id }: RemoveHospitalArgs) => {
  await Promise.all([
    removeUser({ userTypeID: id }),
    deleteDoc(doc(db, COLLECTION_NAME, id)),
  ]);
};
