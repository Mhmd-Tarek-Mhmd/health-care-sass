import {
  doc,
  query,
  where,
  getDoc,
  getDocs,
  Timestamp,
  writeBatch,
  collection,
  arrayRemove,
  DocumentReference,
  getCountFromServer,
} from "firebase/firestore";
import Store from "@store";
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
  const hospitalID = Store.auth?.user?.hospital.id;
  const filters = [where("hospitalID", "==", hospitalID)];
  const rooms = await paginator<Room>({
    filters,
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const roomsPromises = rooms.items.map(async (room) =>
    getRoom({ id: room.id })
  );

  const items = await Promise.all(roomsPromises);
  return { ...rooms, items };
};

export interface GetRoomArgs {
  id: string;
}

export const getRoom = async ({ id }: GetRoomArgs): Promise<Room> => {
  const roomDoc = await getDoc(doc(db, COLLECTION_NAME, id));
  const room = { id, ...roomDoc?.data() } as Room;

  if (room.beds.length) {
    const bedsPromises = room.beds.map(async (bed) => {
      const bedDoc = await getDoc(bed as unknown as DocumentReference);
      return { id: bedDoc.id, ...bedDoc?.data() } as Bed;
    });
    const beds = await Promise.all(bedsPromises);
    return { ...room, beds };
  } else {
    return room;
  }
};

export interface UpsertRoomArgs extends Omit<Room, "beds"> {
  beds: string[];
}

export const saveRoom = async (room: UpsertRoomArgs): Promise<void> => {
  const batch = writeBatch(db);
  let beds = [] as DocumentReference[];
  const roomRef = doc(collection(db, COLLECTION_NAME));

  if (room?.beds?.length) {
    beds = room.beds.map((bed) => doc(db, BEDS_COLLECTION_NAME, bed));
    beds.forEach((bed) => {
      batch.update(bed, { room: roomRef });
    });
  }

  const hospitalID = Store.auth?.user?.hospital.id;
  batch.set(roomRef, {
    ...room,
    beds,
    hospitalID,
    createdAt: Timestamp.now(),
  });
  await batch.commit();
};

export const updateRoom = async ({
  id,
  ...room
}: UpsertRoomArgs): Promise<void> => {
  const batch = writeBatch(db);
  let beds = [] as DocumentReference[];
  const roomRef = doc(db, COLLECTION_NAME, id);

  if (room?.beds?.length) {
    beds = room.beds.map((bed) => doc(db, BEDS_COLLECTION_NAME, bed));
    beds.forEach((bed) => {
      batch.update(bed, { room: roomRef });
    });
  }

  const hospitalID = Store.auth?.user?.hospital.id;
  batch.update(roomRef, {
    ...room,
    beds,
    hospitalID,
    updatedAt: Timestamp.now(),
  });
  await batch.commit();
};

export type RemoveRoomArgs = {
  id: string;
};
export const removeRoom = async ({ id }: RemoveRoomArgs) => {
  const roomBedsSnapshot = await getCountFromServer(
    query(
      collection(db, BEDS_COLLECTION_NAME),
      where("room", "==", doc(db, COLLECTION_NAME, id))
    )
  );
  if (roomBedsSnapshot.data().count) {
    throw new Error("Can't remove a room with current beds.");
  }

  const batch = writeBatch(db);
  const roomRef = doc(db, COLLECTION_NAME, id);
  const beds = await getDocs(collection(db, BEDS_COLLECTION_NAME));

  batch.delete(roomRef);
  beds.docs.forEach((doc) =>
    batch.update(doc.ref, {
      room: arrayRemove(roomRef),
    })
  );

  await batch.commit();
};
