import {
  doc,
  addDoc,
  getDoc,
  updateDoc,
  Timestamp,
  deleteDoc,
  collection,
  DocumentReference,
} from "firebase/firestore";
import { logUp } from "./auth";
import { db } from "./firebase";
import paginator from "./paginator";
import { removeUser } from "./users";
import { userTypes } from "@constants";
import { PaginatorResponse, Nurse, Doctor } from "@types";
import { COLLECTION_NAME as DOCTORS_COLLECTION_NAME } from "./doctors";

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
  let doctors = [] as DocumentReference[];

  if (nurse?.doctors?.length) {
    doctors = nurse.doctors.map((doctor) =>
      doc(db, DOCTORS_COLLECTION_NAME, doctor)
    );
  }

  const nurseData = { ...nurse, doctors };

  if (isEdit) {
    await updateDoc(doc(db, COLLECTION_NAME, nurse?.id), {
      ...nurseData,
      updatedAt: Timestamp.now(),
    });
  } else {
    const nurseRef = collection(db, COLLECTION_NAME);
    await addDoc(nurseRef, {
      ...nurseData,
      createdAt: Timestamp.now(),
    });

    try {
      await logUp({
        type: userTypes.DOCTOR,
        userTypeID: nurseRef.id,
        password: "123456",
        email: nurse?.email,
        firstName: nurse?.name,
        lastName: "",
      });
    } catch (error) {
      await deleteDoc(doc(db, COLLECTION_NAME, nurseRef.id));
      throw new Error(error.message);
    }
  }
};

export type RemoveNurseArgs = {
  id: string;
};
export const removeNurse = async ({ id }: RemoveNurseArgs) => {
  await Promise.all([
    removeUser({ userTypeID: id }),
    deleteDoc(doc(db, COLLECTION_NAME, id)),
  ]);
};
