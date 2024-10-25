import {
  doc,
  addDoc,
  getDoc,
  getDocs,
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
import { PaginatorResponse, Nurse, Doctor } from "@types";

const COLLECTION_NAME = "nurses";

export interface GetNursesArgs {
  pageSize: number;
  pageNumber: number;
}
export const getNurses = async ({
  pageSize,
  pageNumber,
}: GetNursesArgs): Promise<PaginatorResponse<Nurse>> => {
  const nurses = await paginator<Nurse>({
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const nursesPromises = nurses.items.map(async (nurse) => {
    const doctorsPromises = nurse.doctors.map(async (doctor) => {
      const doctorDoc = await getDoc(doctor as unknown as DocumentReference);
      return { id: doctorDoc.id, ...doctorDoc?.data() } as Doctor;
    });

    const doctors = await Promise.all(doctorsPromises);
    return { ...nurse, doctors };
  });

  const items = await Promise.all(nursesPromises);
  return { ...nurses, items };
};

export interface GetNurseArgs {
  id: string;
}

export const getNurse = async ({ id }: GetNurseArgs): Promise<Nurse> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  const nurse = { id, ...docRef?.data() } as Nurse;
  if (nurse.doctors.length) {
    const doctorsPromises = nurse.doctors.map(async (doctor) => {
      const doctorDoc = await getDoc(doctor as unknown as DocumentReference);
      return { id: doctorDoc.id, ...doctorDoc?.data() } as Doctor;
    });

    const doctors = await Promise.all(doctorsPromises);
    return { ...nurse, doctors };
  } else {
    return nurse;
  }
};

export interface UpsertNurseArgs extends Omit<Nurse, "doctors"> {
  doctors: string[];
}

export const upsertNurse = async (nurse: UpsertNurseArgs): Promise<void> => {
  const isEdit = Boolean(nurse?.id);
  let doctorsRefs = [] as DocumentReference[];

  if (nurse?.doctors?.length) {
    const doctorsPromises = nurse.doctors.map(async (doctor) => {
      const doctorDoc = await getDoc(doctor as unknown as DocumentReference);
      return doctorDoc?.ref;
    });
    doctorsRefs = await Promise.all(doctorsPromises);
  }

  if (isEdit) {
    await updateDoc(doc(db, COLLECTION_NAME, nurse?.id), {
      ...nurse,
      doctors: doctorsRefs,
      updatedAt: Timestamp.now(),
    });
  } else {
    const nurseRef = collection(db, COLLECTION_NAME);
    await Promise.all([
      addDoc(nurseRef, {
        ...nurse,
        doctors: doctorsRefs,
        createdAt: Timestamp.now(),
      }),
      logUp({
        type: userTypes.NURSE,
        password: "123456",
        email: nurse?.email,
        firstName: nurse?.name,
        lastName: "",
      }),
    ]);
  }
};

export type RemoveNurseArgs = {
  id: string;
};
export const removeNurse = async ({ id }: RemoveNurseArgs) => {
  await Promise.all([
    deleteDoc(doc(db, "users", id)),
    deleteDoc(doc(db, COLLECTION_NAME, id)),
  ]);
};
