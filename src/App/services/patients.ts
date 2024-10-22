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
import { logUp } from "./auth";
import { db } from "./firebase";
import paginator from "./paginator";
import { PaginatorResponse, Patient, Doctor } from "@types";
import { COLLECTION_NAME as DOCTORS_COLLECTION_NAME } from "./doctors";

const COLLECTION_NAME = "patients";

export interface GetPatientsArgs {
  pageSize: number;
  pageNumber: number;
}
export const getPatients = async ({
  pageSize,
  pageNumber,
}: GetPatientsArgs): Promise<PaginatorResponse<Patient>> => {
  const patients = await paginator<Patient>({
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const items = await Promise.all(
    patients.items.map(async (patient) => {
      const doctors = await Promise.all(
        patient.doctors.map(async (doctor) => {
          const doctorDoc = await getDoc(
            doc(db, DOCTORS_COLLECTION_NAME, doctor?.id)
          );

          return { id: doctorDoc.id, ...doctorDoc?.data() } as Doctor;
        })
      );
      return { ...patient, doctors };
    })
  );

  return { ...patients, items };
};

export interface GetPatientArgs {
  id: string;
}

export const getPatient = async ({ id }: GetPatientArgs): Promise<Patient> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  const patient = { id, ...docRef?.data() } as Patient;
  if (patient.doctors.length) {
    const doctors = await Promise.all(
      patient.doctors.map(async (doctor) => {
        const doctorDoc = await getDoc(
          doc(db, DOCTORS_COLLECTION_NAME, doctor?.id)
        );

        return { id: doctorDoc.id, ...doctorDoc?.data() } as Doctor;
      })
    );
    return { ...patient, doctors };
  } else {
    return patient;
  }
};

export interface UpsertPatientArgs extends Omit<Patient, "doctors"> {
  doctors: string[];
}

export const savePatient = async ({
  doctors,
  ...patient
}: UpsertPatientArgs): Promise<void> => {
  let doctorsArr = [] as DocumentReference[];
  if (doctors.length) {
    doctorsArr = await Promise.all(
      doctors.map(async (doctor) => {
        const doctorDoc = await getDoc(
          doc(db, DOCTORS_COLLECTION_NAME, doctor)
        );

        return doctorDoc?.ref;
      })
    );
  }
  await addDoc(collection(db, COLLECTION_NAME), {
    ...patient,
    doctors: doctorsArr,
    createdAt: Timestamp.now(),
  });
  await logUp({
    type: "patient",
    password: "123456",
    email: patient?.email,
    firstName: patient?.name,
    lastName: "",
  });
};

export const updatePatient = async ({
  id,
  doctors,
  ...patient
}: UpsertPatientArgs): Promise<void> => {
  let doctorsArr = [] as DocumentReference[];
  if (doctors.length) {
    doctorsArr = await Promise.all(
      doctors.map(async (doctor) => {
        const doctorDoc = await getDoc(
          doc(db, DOCTORS_COLLECTION_NAME, doctor)
        );

        return doctorDoc?.ref;
      })
    );
  }
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...patient,
    doctors: doctorsArr,
    updatedAt: Timestamp.now(),
  });
};

export type RemovePatientArgs = {
  id: string;
};
export const removePatient = async ({ id }: RemovePatientArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
