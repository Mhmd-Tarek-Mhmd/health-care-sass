import {
  doc,
  getDoc,
  addDoc,
  updateDoc,
  Timestamp,
  deleteDoc,
  collection,
} from "firebase/firestore";
import { logUp } from "./auth";
import { db } from "./firebase";
import paginator from "./paginator";
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
  const items = await Promise.all(
    nurses.items.map(async (nurse) => {
      const doctors = await Promise.all(
        nurse.doctors.map(async (doctor) => {
          const doctorDoc = await getDoc(
            doc(db, DOCTORS_COLLECTION_NAME, doctor?.id)
          );

          return doctorDoc?.data() as Doctor;
        })
      );
      return { ...nurse, doctors };
    })
  );

  return { ...nurses, items };
};

export interface GetNurseArgs {
  id: string;
}

export const getNurse = async ({ id }: GetNurseArgs): Promise<Nurse> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  const nurse = { id, ...docRef?.data() } as Nurse;
  if (nurse.doctors.length) {
    const doctors = await Promise.all(
      nurse.doctors.map(async (doctor) => {
        const doctorDoc = await getDoc(
          doc(db, DOCTORS_COLLECTION_NAME, doctor?.id)
        );

        return doctorDoc?.data() as Doctor;
      })
    );
    return { ...nurse, doctors };
  } else {
    return nurse;
  }
};

export const saveNurse = async ({
  doctors,
  ...nurse
}: Nurse): Promise<void> => {
  let doctorsArr = [] as Doctor[];
  if (doctors.length) {
    doctorsArr = await Promise.all(
      doctors.map(async (doctor) => {
        const doctorDoc = await getDoc(
          doc(db, DOCTORS_COLLECTION_NAME, doctor?.id)
        );

        return doctorDoc?.data() as Doctor;
      })
    );
  }
  await addDoc(collection(db, COLLECTION_NAME), {
    ...nurse,
    doctors: doctorsArr,
    createdAt: Timestamp.now(),
  });
  await logUp({
    type: "nurse",
    password: "123456",
    email: nurse?.email,
    firstName: nurse?.name,
    lastName: "",
  });
};

export const updateNurse = async ({
  id,
  doctors,
  ...nurse
}: Nurse): Promise<void> => {
  const doctorsArr = await Promise.all(
    doctors.map(async (doctor) => {
      const doctorDoc = await getDoc(
        doc(db, DOCTORS_COLLECTION_NAME, doctor?.id)
      );

      return doctorDoc?.data() as Doctor;
    })
  );
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...nurse,
    doctors: doctorsArr,
    updatedAt: Timestamp.now(),
  });
};

export type RemoveNurseArgs = {
  id: string;
};
export const removeNurse = async ({ id }: RemoveNurseArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
