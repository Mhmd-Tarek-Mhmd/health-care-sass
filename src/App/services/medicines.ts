import {
  doc,
  where,
  addDoc,
  getDoc,
  updateDoc,
  Timestamp,
  deleteDoc,
  collection,
  DocumentReference,
} from "firebase/firestore";
import Store from "@store";
import { db } from "./firebase";
import paginator from "./paginator";
import { PaginatorResponse, Medicine, User } from "@types";
import { COLLECTION_NAME as USERS_COLLECTION_NAME } from "./users";

const COLLECTION_NAME = "medicines";

export interface GetMedicinesArgs {
  pageSize: number;
  pageNumber: number;
}
export const getMedicines = async ({
  pageSize,
  pageNumber,
}: GetMedicinesArgs): Promise<PaginatorResponse<Medicine>> => {
  const hospitalID = Store.auth?.user?.hospital.id;
  const filters = [
    where("hospitalID", "==", hospitalID),
  ];
  const medicines = await paginator<Medicine>({
    filters,
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const medicinesPromises = medicines.items.map(async (medicine) => {
    let createdBy, updatedBy;
    if (medicine.createdBy) {
      const createdByDoc = await getDoc(
        medicine.createdBy as unknown as DocumentReference
      );
      createdBy = { id: createdByDoc.id, ...createdByDoc?.data() } as User;
    }
    if (medicine.updatedBy) {
      const updatedByDoc = await getDoc(
        medicine.updatedBy as unknown as DocumentReference
      );
      updatedBy = { id: updatedByDoc.id, ...updatedByDoc?.data() } as User;
    }

    return { ...medicine, createdBy, updatedBy };
  });

  const items = await Promise.all(medicinesPromises);
  return { ...medicines, items };
};

export interface GetMedicineArgs {
  id: string;
}

export const getMedicine = async ({
  id,
}: GetMedicineArgs): Promise<Medicine> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  const medicine = docRef?.data();
  let createdBy, updatedBy;

  if (medicine?.createdBy) {
    const createdByDoc = await getDoc(
      medicine.createdBy as unknown as DocumentReference
    );
    createdBy = { id: createdByDoc.id, ...createdByDoc?.data() } as User;
  }

  if (medicine?.updatedBy) {
    const updatedByDoc = await getDoc(
      medicine.updatedBy as unknown as DocumentReference
    );
    updatedBy = { id: updatedByDoc.id, ...updatedByDoc?.data() } as User;
  }

  return { id, ...medicine, createdBy, updatedBy } as Medicine;
};

export interface UpsertMedicineArgs extends Medicine {}

export const upsertMedicine = async (
  medicine: UpsertMedicineArgs
): Promise<void> => {
  const isEdit = Boolean(medicine?.id);
  const hospitalID = Store.auth?.user?.hospital.id;
  const userRef = doc(
    db,
    USERS_COLLECTION_NAME,
    Store.auth?.user?.id as string
  );

  if (isEdit) {
    await updateDoc(doc(db, COLLECTION_NAME, medicine?.id), {
      hospitalID,
      name: medicine.name,
      updatedBy: userRef,
      updatedAt: Timestamp.now(),
    });
  } else {
    const medicineRef = collection(db, COLLECTION_NAME);
    await addDoc(medicineRef, {
      hospitalID,
      name: medicine.name,
      createdBy: userRef,
      createdAt: Timestamp.now(),
    });
  }
};

export type RemoveMedicineArgs = {
  id: string;
};
export const removeMedicine = async ({ id }: RemoveMedicineArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
