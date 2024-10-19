import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  collection,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import paginator from "./paginator";
import { PaginatorResponse, Plan } from "@types";

export const COLLECTION_NAME = "plans";

export interface GetPlansArgs {
  pageSize: number;
  pageNumber: number;
}
export const getPlans = async ({
  pageSize,
  pageNumber,
}: GetPlansArgs): Promise<PaginatorResponse<Plan>> => {
  return await paginator<Plan>({
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
};

export interface GetPlanArgs {
  id: string;
}

export const getPlan = async ({ id }: GetPlanArgs): Promise<Plan> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  return { id, ...docRef?.data() } as Plan;
};

export const savePlan = async (plan: Plan): Promise<void> => {
  await addDoc(collection(db, COLLECTION_NAME), {
    ...plan,
    createdAt: Timestamp.now(),
  });
};

export const updatePlan = async ({ id, ...plan }: Plan): Promise<void> => {
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...plan,
    updatedAt: Timestamp.now(),
  });
};

export type RemovePlanArgs = {
  id: string;
};
export const removePlan = async ({ id }: RemovePlanArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
