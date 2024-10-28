import {
  doc,
  where,
  getDoc,
  getDocs,
  deleteDoc,
  Timestamp,
  collection,
  writeBatch,
  arrayUnion,
  arrayRemove,
  DocumentReference,
} from "firebase/firestore";
import Store from "@store";
import { logUp } from "./auth";
import { db } from "./firebase";
import paginator from "./paginator";
import { userTypes } from "@constants";
import { getHospital } from "./hospitals";
import { removeUser, toggleActiveStatus } from "./users";
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
  const hospitalID = Store.auth?.user?.hospital.id as string;
  const filters = [where("hospitalID", "==", hospitalID)];
  const doctors = await paginator<Doctor>({
    filters,
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
    const hospital = await getHospital({ id: hospitalID });
    return { ...doctor, patients, hospital };
  });

  const items = await Promise.all(doctorsPromises);
  return { ...doctors, items };
};

export interface GetDoctorArgs {
  id: string;
}

export const getDoctor = async ({ id }: GetDoctorArgs): Promise<Doctor> => {
  const doctorDoc = await getDoc(doc(db, COLLECTION_NAME, id));
  const doctor = { id, ...doctorDoc?.data() } as Doctor;
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
  const batch = writeBatch(db);
  const isEdit = Boolean(doctor?.id);
  let patients: DocumentReference[] = [];
  const doctorDoc = isEdit
    ? doc(db, COLLECTION_NAME, doctor?.id)
    : doc(collection(db, COLLECTION_NAME));

  if (doctor?.patients?.length) {
    patients = doctor.patients.map((patient) =>
      doc(db, PATIENTS_COLLECTION_NAME, patient)
    );
    patients.forEach((patient) => {
      batch.update(patient, {
        doctors: arrayUnion(doctorDoc),
      });
    });
  }

  const hospitalID = Store.auth?.user?.hospital.id;
  const doctorData = { ...doctor, patients, hospitalID };

  if (isEdit) {
    batch.update(doctorDoc, {
      ...doctorData,
      updatedAt: Timestamp.now(),
    });
    try {
      await batch.commit();
    } catch (error) {
      throw new Error(error.message);
    }
  } else {
    batch.set(doctorDoc, {
      ...doctorData,
      isActive: true,
      createdAt: Timestamp.now(),
    });
    await batch.commit();

    try {
      await logUp({
        type: userTypes.DOCTOR,
        userTypeID: doctorDoc.id,
        password: "123456",
        email: doctor?.email,
        phone: doctor?.phone,
        name: doctor?.name,
      });
    } catch (error) {
      await deleteDoc(doc(db, COLLECTION_NAME, doctorDoc.id));
      throw new Error(error.message);
    }
  }
};

export type ToggleDoctorStatusArgs = {
  id: string;
};
export const toggleDoctorStatus = async ({ id }: ToggleDoctorStatusArgs) => {
  await toggleActiveStatus({ id, collectionName: COLLECTION_NAME });
};

export type RemoveDoctorArgs = {
  id: string;
};
export const removeDoctor = async ({ id }: RemoveDoctorArgs) => {
  const batch = writeBatch(db);
  const doctorRef = doc(db, COLLECTION_NAME, id);
  const patients = await getDocs(collection(db, PATIENTS_COLLECTION_NAME));

  batch.delete(doctorRef);
  patients.docs.forEach((doc) =>
    batch.update(doc.ref, {
      doctors: arrayRemove(doctorRef),
    })
  );

  try {
    await Promise.all([batch.commit(), removeUser({ userTypeID: id })]);
  } catch (error) {
    throw new Error(error.message);
  }
};
