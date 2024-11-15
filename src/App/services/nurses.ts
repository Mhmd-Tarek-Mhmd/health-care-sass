import {
  doc,
  where,
  addDoc,
  getDoc,
  updateDoc,
  Timestamp,
  deleteDoc,
  collection,
  DocumentReference,
} from "firebase/firestore";
import Store from "@store";
import { logUp } from "./auth";
import { db } from "./firebase";
import paginator from "./paginator";
import { userTypes } from "@constants";
import { checkUserTypes } from "@helpers";
import { removeUser, toggleActiveStatus } from "./users";
import { PaginatorResponse, Nurse, Doctor } from "@types";
import { COLLECTION_NAME as DOCTORS_COLLECTION_NAME } from "./doctors";

export const COLLECTION_NAME = "nurses";

export interface GetNursesArgs {
  pageSize: number;
  pageNumber: number;
}
export const getNurses = async ({
  pageSize,
  pageNumber,
}: GetNursesArgs): Promise<PaginatorResponse<Nurse>> => {
  const hospitalID = Store.auth?.user?.hospital.id as string;
  const isDoctor = checkUserTypes([userTypes.DOCTOR]);
  const filters = [
    where("hospitalID", "==", hospitalID),
    ...(isDoctor
      ? [
          where(
            "doctors",
            "array-contains",
            doc(
              db,
              DOCTORS_COLLECTION_NAME,
              Store.auth?.user?.userTypeID as string
            )
          ),
        ]
      : []),
  ];

  const nurses = await paginator<Nurse>({
    filters,
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const nursesPromises = nurses.items.map((nurse) =>
    getNurse({ id: nurse.id })
  );

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

  const hospitalID = Store.auth?.user?.hospital.id;
  const nurseData = { ...nurse, doctors, hospitalID };

  if (isEdit) {
    await updateDoc(doc(db, COLLECTION_NAME, nurse?.id), {
      ...nurseData,
      updatedAt: Timestamp.now(),
    });
  } else {
    const nurseRef = collection(db, COLLECTION_NAME);
    const nursesDoc = await addDoc(nurseRef, {
      ...nurseData,
      isActive: true,
      createdAt: Timestamp.now(),
    });

    try {
      await logUp({
        type: userTypes.NURSE,
        userTypeID: nursesDoc.id,
        password: "123456",
        email: nurse?.email,
        phone: nurse?.phone,
        name: nurse?.name,
      });
    } catch (error) {
      await deleteDoc(doc(db, COLLECTION_NAME, nurseRef.id));
      throw new Error(error.message);
    }
  }
};

export type ToggleNurseStatusArgs = {
  id: string;
};
export const toggleNurseStatus = async ({ id }: ToggleNurseStatusArgs) => {
  await toggleActiveStatus({ id, collectionName: COLLECTION_NAME });
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
