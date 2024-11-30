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
import { getHospital } from "./hospitals";
import { FirebaseError } from "firebase/app";
import { removeUser, toggleActiveStatus } from "./users";
import { PaginatorResponse, Nurse, Doctor } from "@types";
import { COLLECTION_NAME as DOCTORS_COLLECTION_NAME } from "./doctors";

export const COLLECTION_NAME = "nurses";
const formatNurse = async (
  nurse: Nurse & { hospitalID: string }
): Promise<Nurse> => {
  console.log(nurse);
  let doctors: Doctor[] = [];

  if (nurse.doctors.length) {
    const doctorsPromises = nurse.doctors.map(async (doctor) => {
      const doctorDoc = await getDoc(doctor as unknown as DocumentReference);
      return { id: doctorDoc.id, ...doctorDoc?.data() } as Doctor;
    });

    doctors = await Promise.all(doctorsPromises);
    return { ...nurse, doctors };
  }

  const hospital = await getHospital({ id: nurse?.hospitalID });
  return { ...nurse, hospital, doctors };
};

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
  const nursesPromises = nurses.items.map(formatNurse);
  const items = await Promise.all(nursesPromises);
  return { ...nurses, items };
};

export interface GetNurseArgs {
  id: string;
}

export const getNurse = async ({ id }: GetNurseArgs): Promise<Nurse> => {
  const nurseDoc = await getDoc(doc(db, COLLECTION_NAME, id));
  const nurse = { id, ...nurseDoc?.data() } as Nurse;
  return formatNurse(nurse);
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
    if (!Store.auth?.user?.hospital.canAddNewUser) {
      throw new Error(
        "Can't create a new nurse. You have reached to limit of this plan."
      );
    }

    const newDoc = await addDoc(collection(db, COLLECTION_NAME), {
      ...nurseData,
      isActive: true,
      createdAt: Timestamp.now(),
    });

    if (!newDoc?.id) {
      throw new Error("toast.default-error-desc");
    }

    try {
      await logUp({
        type: userTypes.NURSE,
        userTypeID: newDoc.id,
        password: "123456",
        email: nurse?.email,
        phone: nurse?.phone,
        name: nurse?.name,
      });
    } catch (error) {
      await deleteDoc(doc(db, COLLECTION_NAME, newDoc.id));
      throw new Error(
        (error as FirebaseError)?.code ||
          (error as FirebaseError)?.message ||
          "toast.default-error-desc"
      );
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
