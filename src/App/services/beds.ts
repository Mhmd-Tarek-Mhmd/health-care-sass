import {
  doc,
  where,
  getDoc,
  Timestamp,
  deleteDoc,
  collection,
  writeBatch,
  arrayUnion,
  DocumentReference,
} from "firebase/firestore";
import Store from "@store";
import { db } from "./firebase";
import paginator from "./paginator";
import { PaginatorResponse, Bed, Room } from "@types";
import { COLLECTION_NAME as ROOMS_COLLECTION_NAME } from "./rooms";

export const COLLECTION_NAME = "beds";

export interface GetBedsArgs {
  pageSize: number;
  pageNumber: number;
}
export const getBeds = async ({
  pageSize,
  pageNumber,
}: GetBedsArgs): Promise<PaginatorResponse<Bed>> => {
  const hospitalID = Store.auth?.user?.hospital.id;
  const filters = [where("hospitalID", "==", hospitalID)];
  const beds = await paginator<Bed>({
    filters,
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const bedsPromises = beds.items.map((bed) => getBed({ id: bed.id }));

  const items = await Promise.all(bedsPromises);
  return { ...beds, items };
};

export interface GetBedArgs {
  id: string;
}

export const getBed = async ({ id }: GetBedArgs): Promise<Bed> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  const bed = { id, ...docRef?.data() } as Bed;

  if (bed?.room) {
    const roomDoc = await getDoc(bed.room as unknown as DocumentReference);
    const room = { id: roomDoc.id, ...roomDoc?.data() } as Room;
    return { ...bed, room };
  } else {
    return bed;
  }
};

export interface UpsertBedArgs extends Omit<Bed, "room"> {
  room: string;
}

export const saveBed = async (bed: UpsertBedArgs): Promise<void> => {
  const batch = writeBatch(db);
  let room: string | DocumentReference = "";
  const bedRef = doc(collection(db, COLLECTION_NAME));

  if (bed?.room) {
    room = doc(db, ROOMS_COLLECTION_NAME, bed.room);
    batch.update(room, { beds: arrayUnion(bedRef) });
  }

  const hospitalID = Store.auth?.user?.hospital.id;
  batch.set(bedRef, {
    ...bed,
    room,
    hospitalID,
    createdAt: Timestamp.now(),
  });
  await batch.commit();
};

export const updateBed = async ({
  id,
  ...bed
}: UpsertBedArgs): Promise<void> => {
  const batch = writeBatch(db);
  let room: string | DocumentReference = "";
  const bedRef = doc(db, COLLECTION_NAME, id);

  if (bed?.room) {
    room = doc(db, ROOMS_COLLECTION_NAME, bed.room);
    batch.update(room, { beds: arrayUnion(bedRef) });
  }

  const hospitalID = Store.auth?.user?.hospital.id;
  batch.update(bedRef, {
    ...bed,
    room,
    hospitalID,
    updatedAt: Timestamp.now(),
  });
  await batch.commit();
};

export type RemoveBedArgs = {
  id: string;
};
export const removeBed = async ({ id }: RemoveBedArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
