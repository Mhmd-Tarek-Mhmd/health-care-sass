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
  const roomsPromises = rooms.items.map(async (room) => {
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
  });

  const items = await Promise.all(roomsPromises);
  return { ...rooms, items };
};

export interface GetRoomArgs {
  id: string;
}

export const getRoom = async ({ id }: GetRoomArgs): Promise<Room> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  const room = { id, ...docRef?.data() } as Room;

  if (room.beds.length) {
    const bedsPromises = room.beds.map(async (bed) => {
      const doctorDoc = await getDoc(bed as unknown as DocumentReference);
      return { id: doctorDoc.id, ...doctorDoc?.data() } as Bed;
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
  let bedsRefs = [] as DocumentReference[];
  if (room?.beds?.length) {
    const bedsPromises = room.beds.map(async (bed) => {
      const doctorDoc = await getDoc(bed as unknown as DocumentReference);
      return doctorDoc?.ref;
    });
    bedsRefs = await Promise.all(bedsPromises);
  }
  await addDoc(collection(db, COLLECTION_NAME), {
    ...room,
    beds: bedsRefs,
    createdAt: Timestamp.now(),
  });
};

export const updateRoom = async ({
  id,
  ...room
}: UpsertRoomArgs): Promise<void> => {
  let bedsRefs = [] as DocumentReference[];
  if (room?.beds?.length) {
    const bedsPromises = room.beds.map(async (bed) => {
      const doctorDoc = await getDoc(bed as unknown as DocumentReference);
      return doctorDoc?.ref;
    });
    bedsRefs = await Promise.all(bedsPromises);
  }
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...room,
    beds: bedsRefs,
    updatedAt: Timestamp.now(),
  });
};

export type RemoveRoomArgs = {
  id: string;
};
export const removeRoom = async ({ id }: RemoveRoomArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
