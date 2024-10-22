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
import { Bed, PaginatorResponse, Room } from "@types";
import { COLLECTION_NAME as BEDS_COLLECTION_NAME } from "./beds";

export const COLLECTION_NAME = "rooms";

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
            const bedDoc = await getDoc(doc(db, BEDS_COLLECTION_NAME, bed?.id));
            return { id: bedDoc.id, ...bedDoc?.data() } as Bed;
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
  const room = { id, ...docRef?.data() } as Room;
  if (room.beds.length) {
    const beds = await Promise.all(
      room.beds.map(async (bed) => {
        const doctorDoc = await getDoc(doc(db, BEDS_COLLECTION_NAME, bed.id));

        return { id: doctorDoc.id, ...doctorDoc?.data() } as Bed;
      })
    );
    return { ...room, beds };
  } else {
    return room;
  }
};

export interface UpsertRoomArgs extends Omit<Room, "beds"> {
  beds: string[];
}

export const saveRoom = async ({
  beds,
  ...room
}: UpsertRoomArgs): Promise<void> => {
  let bedsArr = [] as DocumentReference[];
  if (beds.length) {
    bedsArr = await Promise.all(
      beds.map(async (bed) => {
        const doctorDoc = await getDoc(doc(db, BEDS_COLLECTION_NAME, bed));
        return doctorDoc?.ref;
      })
    );
  }
  await addDoc(collection(db, COLLECTION_NAME), {
    ...room,
    beds: bedsArr,
    createdAt: Timestamp.now(),
  });
};

export const updateRoom = async ({
  id,
  beds,
  ...room
}: UpsertRoomArgs): Promise<void> => {
  let bedsArr = [] as DocumentReference[];
  if (beds.length) {
    bedsArr = await Promise.all(
      beds.map(async (bed) => {
        const doctorDoc = await getDoc(doc(db, BEDS_COLLECTION_NAME, bed));
        return doctorDoc?.ref;
      })
    );
  }
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...room,
    beds: bedsArr,
    updatedAt: Timestamp.now(),
  });
};

export type RemoveRoomArgs = {
  id: string;
};
export const removeRoom = async ({ id }: RemoveRoomArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
