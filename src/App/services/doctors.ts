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
import { PaginatorResponse, Doctor, Patient } from "@types";
// import { COLLECTION_NAME as PATIENTS_COLLECTION_NAME } from "./patients";

let PATIENTS_COLLECTION_NAME = "patients";
const COLLECTION_NAME = "doctors";

export interface GetDoctorsArgs {
  pageSize: number;
  pageNumber: number;
}
export const getDoctors = async ({
  pageSize,
  pageNumber,
}: GetDoctorsArgs): Promise<PaginatorResponse<Doctor>> => {
  const doctors = await paginator<Doctor>({
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const items = await Promise.all(
    doctors.items.map(async (doctor) => {
      const patients = await Promise.all(
        doctor.patients.map(async (patient) => {
          const patientDoc = await getDoc(
            doc(db, PATIENTS_COLLECTION_NAME, patient?.id)
          );

          return patientDoc?.data() as Patient;
        })
      );
      return { ...doctor, patients };
    })
  );

  return { ...doctors, items };
};

export interface GetDoctorArgs {
  id: string;
}

export const getDoctor = async ({ id }: GetDoctorArgs): Promise<Doctor> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  const doctor = { id, ...docRef?.data() } as Doctor;
  if (doctor.patients.length) {
    const patients = await Promise.all(
      doctor.patients.map(async (patient) => {
        const patientDoc = await getDoc(
          doc(db, PATIENTS_COLLECTION_NAME, patient?.id)
        );

        return patientDoc?.data() as Patient;
      })
    );
    return { ...doctor, patients };
  } else {
    return doctor;
  }
};

export const saveDoctor = async ({
  patients,
  ...doctor
}: Doctor): Promise<void> => {
  let patientsArr = [] as Patient[];
  console.log(patients,patientsArr)
  if (patients.length) {
    console.log('first')
    patientsArr = await Promise.all(
      patients.map(async (patient) => {
        const patientDoc = await getDoc(
          doc(db, PATIENTS_COLLECTION_NAME, patient?.id)
        );

        return patientDoc?.data() as Patient;
      })
    );
  }
  await addDoc(collection(db, COLLECTION_NAME), {
    ...doctor,
    patients: patientsArr,
    createdAt: Timestamp.now(),
  });
  await logUp({
    type: "doctor",
    password: "123456",
    email: doctor?.email,
    firstName: doctor?.name,
    lastName: "",
  });
};

export const updateDoctor = async ({
  id,
  patients,
  ...doctor
}: Doctor): Promise<void> => {
  const patientsArr = await Promise.all(
    patients.map(async (patient) => {
      const patientDoc = await getDoc(
        doc(db, PATIENTS_COLLECTION_NAME, patient?.id)
      );

      return patientDoc?.data() as Patient;
    })
  );
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...doctor,
    patients: patientsArr,
    updatedAt: Timestamp.now(),
  });
};

export type RemoveDoctorArgs = {
  id: string;
};
export const removeDoctor = async ({ id }: RemoveDoctorArgs) => {
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
