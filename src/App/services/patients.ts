import {
  doc,
  where,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  Timestamp,
  collection,
  writeBatch,
  arrayRemove,
  DocumentReference,
} from "firebase/firestore";
import {
  getBed,
  getBeds,
  COLLECTION_NAME as BEDS_COLLECTION_NAME,
} from "./beds";
import Store from "@store";
import { db } from "./firebase";
import { getRooms } from "./rooms";
import paginator from "./paginator";
import { removeUser } from "./users";
import { userTypes } from "@constants";
import { logUp, LogUpArgs } from "./auth";
import { getHospital } from "./hospitals";
import { buildOptionModel } from "@helpers";
import { PaginatorResponse, Patient } from "@types";
import { COLLECTION_NAME as APPOINTMENTS_COLLECTION_NAME } from "./appointments";

export const COLLECTION_NAME = "patients";

export interface GetPatientsArgs {
  pageSize: number;
  pageNumber: number;
}
export const getPatients = async ({
  pageSize,
  pageNumber,
}: GetPatientsArgs): Promise<PaginatorResponse<Patient>> => {
  const hospitalID = Store.auth?.user?.hospital.id as string;
  const filters = [where("hospitals", "array-contains", hospitalID)];

  const patients = await paginator<Patient>({
    filters,
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const patientsPromises = patients.items.map((patient) =>
    getPatient({ id: patient.id })
  );

  const items = await Promise.all(patientsPromises);
  return { ...patients, items };
};

export interface GetPatientArgs {
  id: string;
}

export const getPatient = async ({ id }: GetPatientArgs): Promise<Patient> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  const patient = { id, ...docRef?.data() } as Patient;

  let bed;
  if (patient?.bed) {
    bed = await getBed({ id: patient.bed.id });
  }

  const hospitalID = Store.auth?.user?.hospital.id as string;
  const hospital = await getHospital({ id: hospitalID });
  return { ...patient, bed, hospitals: [hospital] };
};

export const getPatientModalOptions = async () => {
  const res = await Promise.all([
    getBeds({ pageSize: 999, pageNumber: 1 }),
    getRooms({ pageSize: 999, pageNumber: 1 }),
  ]);

  return {
    beds: res[0].items.map(buildOptionModel),
    rooms: res[1].items.map(buildOptionModel),
  };
};

export interface UpsertPatientArgs extends Omit<Patient, "bed"> {
  bed: string;
}

export const upsertPatient = async (
  patient: UpsertPatientArgs
): Promise<void> => {
  const isEdit = Boolean(patient?.id);

  let bed: string | DocumentReference = "";
  if (patient?.bed) {
    bed = doc(db, BEDS_COLLECTION_NAME, patient.bed);
  }

  const hospitalID = Store.auth?.user?.hospital.id;
  const patientData = {
    ...patient,
    bed,
    hospitals: [hospitalID],
  };

  if (isEdit) {
    await updateDoc(doc(db, COLLECTION_NAME, patient?.id), {
      ...patientData,
      updatedAt: Timestamp.now(),
    });
  } else {
    const patientCollection = collection(db, COLLECTION_NAME);
    const patientRef = doc(patientCollection);
    await addDoc(patientCollection, {
      ...patientData,
      isActive: true,
      createdAt: Timestamp.now(),
    });

    try {
      await logUp({
        type: userTypes.PATIENT,
        userTypeID: patientRef.id,
        password: "123456",
        email: patient?.email,
        phone: patient?.phone,
        name: patient?.name,
      });
    } catch (error) {
      await deleteDoc(doc(db, COLLECTION_NAME, patientRef.id));
      throw new Error(error.message);
    }
  }
};

export interface QuickPatientLogupArgs
  extends Omit<LogUpArgs, "type" | "userTypeID"> {}
export const quickPatientLogup = async ({
  password,
  ...patient
}: QuickPatientLogupArgs) => {
  const patientDoc = await addDoc(collection(db, COLLECTION_NAME), {
    ...patient,
    isActive: true,
    createdAt: Timestamp.now(),
  });
  if (patientDoc?.id) {
    try {
      await logUp({
        isTempPassword: false,
        type: userTypes.PATIENT,
        userTypeID: patientDoc.id,
        password,
        email: patient?.email,
        name: patient?.name,
      });
    } catch (error) {
      await deleteDoc(doc(db, COLLECTION_NAME, patientDoc.id));
      throw new Error(error.message);
    }
  } else {
    throw new Error("toast.default-error-desc");
  }
};

export type RemovePatientArgs = {
  id: string;
};
export const removePatient = async ({ id }: RemovePatientArgs) => {
  const batch = writeBatch(db);
  const patientRef = doc(db, COLLECTION_NAME, id);
  const appointments = await getDocs(
    collection(db, APPOINTMENTS_COLLECTION_NAME)
  );

  batch.delete(patientRef);
  appointments.docs.forEach((doc) =>
    batch.update(doc.ref, {
      patients: arrayRemove(patientRef.id),
    })
  );

  await Promise.all([removeUser({ userTypeID: id }), batch.commit()]);
};
