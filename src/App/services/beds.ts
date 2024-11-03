import {
  doc,
  where,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  deleteDoc,
  collection,
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

  const bedsPromises = beds.items.map(async (bed) => {
    let room;
    if (bed.room) {
      const roomDoc = await getDoc(bed.room as unknown as DocumentReference);
      room = { id: roomDoc.id, ...roomDoc?.data() } as Room;
    }

    return { ...bed, room };
  });

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
  let room: string | DocumentReference = "";

  if (bed?.room) {
    room = doc(db, ROOMS_COLLECTION_NAME, bed.room);
  }

  const hospitalID = Store.auth?.user?.hospital.id;
  await addDoc(collection(db, COLLECTION_NAME), {
    ...bed,
    room,
    hospitalID,
    createdAt: Timestamp.now(),
  });
};

export const updateBed = async ({ id, ...bed }: UpsertBedArgs): Promise<void> => {
  let room: string | DocumentReference = "";

  if (bed?.room) {
    room = doc(db, ROOMS_COLLECTION_NAME, bed.room);
  }

  const hospitalID = Store.auth?.user?.hospital.id;
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...bed,
    room,
    hospitalID,
    updatedAt: Timestamp.now(),
  });
};

export type RemoveBedArgs = {
  id: string;
};
export const removeBed = async ({ id }: RemoveBedArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
