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
import { db } from "./firebase";
import paginator from "./paginator";
import { PaginatorResponse, Room } from "@types";
import { COLLECTION_NAME as BEDS_COLLECTION_NAME } from "./beds";

const COLLECTION_NAME = "rooms";

export interface GetRoomsArgs {
  pageSize: number;
  pageNumber: number;
}
export const getRooms = async ({
  pageSize,
  pageNumber,
}: GetRoomsArgs): Promise<PaginatorResponse<Room>> => {
  const rooms = await paginator<Room>({
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const items = await Promise.all(
    rooms.items.map(async (room) => {
      if (room.beds.length) {
        const beds = await Promise.all(
          room.beds.map(async (bed) => {
            const bedDoc = await getDoc(
              doc(db, BEDS_COLLECTION_NAME, (bed as DocumentReference)?.id)
            );
            return bedDoc?.data()?.name as string;
          })
        );
        return { ...room, beds };
      } else {
        return room;
      }
    })
  );

  return { ...rooms, items };
};

export interface GetRoomArgs {
  id: string;
}

export const getRoom = async ({ id }: GetRoomArgs): Promise<Room> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  return { id, ...docRef?.data(), beds: docRef?.data()?.beds?.id } as Room;
};

export const saveRoom = async ({ beds, ...room }: Room): Promise<void> => {
  const bedsDocs = await Promise.all(
    beds.map(async (bed) => {
      const bedDoc = await getDoc(
        doc(db, BEDS_COLLECTION_NAME, bed as unknown as string)
      );
      return bedDoc.ref;
    })
  );
  await addDoc(collection(db, COLLECTION_NAME), {
    ...room,
    beds: bedsDocs,
    createdAt: Timestamp.now(),
  });
};

export const updateRoom = async ({
  id,
  beds,
  ...room
}: Room): Promise<void> => {
  const bedsDocs = await Promise.all(
    beds.map(async (bed) => {
      const bedDoc = await getDoc(
        doc(db, BEDS_COLLECTION_NAME, bed as unknown as string)
      );
      return bedDoc.ref;
    })
  );
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...room,
    beds: bedsDocs,
    updatedAt: Timestamp.now(),
  });
};

export type RemoveRoomArgs = {
  id: string;
};
export const removeRoom = async ({ id }: RemoveRoomArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
