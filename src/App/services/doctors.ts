import {
  doc,
  getDoc,
  getDocs,
  Timestamp,
  collection,
  writeBatch,
  arrayUnion,
  arrayRemove,
  DocumentReference,
} from "firebase/firestore";
import { logUp } from "./auth";
import { db } from "./firebase";
import paginator from "./paginator";
import { userTypes } from "@constants";
import { PaginatorResponse, Doctor, Patient } from "@types";
import { COLLECTION_NAME as PATIENTS_COLLECTION_NAME } from "./patients";

export const COLLECTION_NAME = "doctors";

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
  const doctorsPromises = doctors.items.map(async (doctor) => {
    const patientsPromises = doctor.patients.map(async (patientRef) => {
      const patientDoc = await getDoc(
        patientRef as unknown as DocumentReference
      );
      return { id: patientDoc.id, ...patientDoc?.data() } as Patient;
    });

    const patients = await Promise.all(patientsPromises);
    return { ...doctor, patients };
  });

  const items = await Promise.all(doctorsPromises);
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
      doctor.patients.map(async (patientRef) => {
        const patientDoc = await getDoc(
          patientRef as unknown as DocumentReference
        );
        return { id: patientDoc.id, ...patientDoc?.data() } as Patient;
      })
    );
    return { ...doctor, patients };
  } else {
    return doctor;
  }
};

export interface UpsertDoctorArgs extends Omit<Doctor, "patients"> {
  patients: string[];
}

export const upsertDoctor = async (doctor: UpsertDoctorArgs): Promise<void> => {
  const isEdit = Boolean(doctor?.id);
  const batch = writeBatch(db);
  const patients = doctor.patients.map((patient) =>
    doc(db, PATIENTS_COLLECTION_NAME, patient)
  );
  const doctorRef = doc(collection(db, COLLECTION_NAME));
  const doctorData = {
    ...doctor,
    patients,
    ...(isEdit
      ? { updatedAt: Timestamp.now() }
      : { createdAt: Timestamp.now() }),
  };

  isEdit
    ? batch.update(doctorRef, doctorData)
    : batch.set(doctorRef, doctorData);
  patients.forEach((patient) => {
    batch.update(patient, {
      doctors: arrayUnion(doctorRef),
    });
  });

  try {
    Promise.all([
      batch.commit(),
      ...(isEdit
        ? []
        : [
            logUp({
              type: userTypes.DOCTOR,
              password: "123456",
              email: doctor?.email,
              firstName: doctor?.name,
              lastName: "",
            }),
          ]),
    ]);
  } catch (error) {
    throw new Error(error.message);
  }
};

export type RemoveDoctorArgs = {
  id: string;
};
export const removeDoctor = async ({ id }: RemoveDoctorArgs) => {
  const batch = writeBatch(db);
  const doctorRef = doc(db, COLLECTION_NAME, id);
  const userDoc = await getDoc(doc(db, "users", id));
  const patients = await getDocs(collection(db, PATIENTS_COLLECTION_NAME));

  batch.delete(doctorRef);
  batch.delete(userDoc.ref);
  patients.docs.forEach((doc) =>
    batch.update(doc.ref, {
      doctors: arrayRemove(doctorRef),
    })
  );

  try {
    await batch.commit();
  } catch (error) {
    throw new Error(error.message);
  }
};
