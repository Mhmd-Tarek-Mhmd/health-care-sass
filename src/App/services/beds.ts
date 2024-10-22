import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  deleteDoc,
  collection,
} from "firebase/firestore";
import { db } from "./firebase";
import paginator from "./paginator";
import { PaginatorResponse, Bed } from "@types";

export const COLLECTION_NAME = "beds";

export interface GetBedsArgs {
  pageSize: number;
  pageNumber: number;
}
export const getBeds = async ({
  pageSize,
  pageNumber,
}: GetBedsArgs): Promise<PaginatorResponse<Bed>> => {
  return await paginator<Bed>({
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
};

export interface GetBedArgs {
  id: string;
}

export const getBed = async ({ id }: GetBedArgs): Promise<Bed> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  return { id, ...docRef?.data() } as Bed;
};

export const saveBed = async (bed: Bed): Promise<void> => {
  await addDoc(collection(db, COLLECTION_NAME), {
    ...bed,
    createdAt: Timestamp.now(),
  });
};

export const updateBed = async ({ id, ...bed }: Bed): Promise<void> => {
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...bed,
    updatedAt: Timestamp.now(),
  });
};

export type RemoveBedArgs = {
  id: string;
};
export const removeBed = async ({ id }: RemoveBedArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
