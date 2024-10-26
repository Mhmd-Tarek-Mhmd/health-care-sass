import {
  doc,
  where,
  addDoc,
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
import {
  getDoctors,
  COLLECTION_NAME as DOCTORS_COLLECTION_NAME,
} from "./doctors";
import Store from "@store";
import { db } from "./firebase";
import paginator from "./paginator";
import { removeUser } from "./users";
import { userTypes } from "@constants";
import { logUp, LogUpArgs } from "./auth";
import { buildOptionModel, checkUserTypes } from "@helpers";
import { PaginatorResponse, Patient, Doctor, Room, Bed } from "@types";
import { getBeds, COLLECTION_NAME as BEDS_COLLECTION_NAME } from "./beds";
import { getRooms, COLLECTION_NAME as ROOMS_COLLECTION_NAME } from "./rooms";

export const COLLECTION_NAME = "patients";

export interface GetPatientsArgs {
  pageSize: number;
  pageNumber: number;
}
export const getPatients = async ({
  pageSize,
  pageNumber,
}: GetPatientsArgs): Promise<PaginatorResponse<Patient>> => {
  const isDoctor = checkUserTypes([userTypes.DOCTOR]);
  const filters = [
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

  const patients = await paginator<Patient>({
    filters,
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const patientsPromises = patients.items.map(async (patient) => {
    let bed,
      room,
      doctors: Doctor[] = [];

    if (patient.doctors.length) {
      const doctorsPromises = patient.doctors.map(async (doctor) => {
        const doctorDoc = await getDoc(doctor as unknown as DocumentReference);
        return { id: doctorDoc.id, ...doctorDoc?.data() } as Doctor;
      });
      doctors = await Promise.all(doctorsPromises);
    }
    if (patient.room) {
      const roomDoc = await getDoc(
        patient.room as unknown as DocumentReference
      );
      room = { id: roomDoc.id, ...roomDoc?.data() } as Room;
    }
    if (patient.bed) {
      const bedDoc = await getDoc(patient.bed as unknown as DocumentReference);
      bed = { id: bedDoc.id, ...bedDoc?.data() } as Bed;
    }
    return { ...patient, room, bed, doctors };
  });

  const items = await Promise.all(patientsPromises);
  return { ...patients, items };
};

export interface GetPatientArgs {
  id: string;
}

export const getPatient = async ({ id }: GetPatientArgs): Promise<Patient> => {
  const docRef = await getDoc(doc(db, COLLECTION_NAME, id));
  const patient = { id, ...docRef?.data() } as Patient;
  let bed,
    room,
    doctors: Doctor[] = [];

  if (patient.doctors.length) {
    doctors = await Promise.all(
      patient.doctors.map(async (doctor) => {
        const doctorDoc = await getDoc(
          doc(db, DOCTORS_COLLECTION_NAME, doctor?.id)
        );

        return { id: doctorDoc.id, ...doctorDoc?.data() } as Doctor;
      })
    );
  }
  if (patient.room) {
    const roomDoc = await getDoc(
      doc(db, ROOMS_COLLECTION_NAME, patient.room.id)
    );
    room = { id: roomDoc.id, ...roomDoc?.data() } as Room;
  }
  if (patient.bed) {
    const bedDoc = await getDoc(doc(db, BEDS_COLLECTION_NAME, patient.bed.id));
    bed = { id: bedDoc.id, ...bedDoc?.data() } as Bed;
  }

  return { ...patient, room, bed, doctors };
};

export const getPatientModalOptions = async () => {
  const res = await Promise.all([
    getBeds({ pageSize: 999, pageNumber: 1 }),
    getRooms({ pageSize: 999, pageNumber: 1 }),
    getDoctors({ pageSize: 999, pageNumber: 1 }),
  ]);

  return {
    beds: res[0].items.map(buildOptionModel),
    rooms: res[1].items.map(buildOptionModel),
    doctors: res[2].items.map(buildOptionModel),
  };
};

export interface UpsertPatientArgs
  extends Omit<Patient, "bed" | "room" | "doctors"> {
  bed: string;
  room: string;
  doctors: string[];
}

export const upsertPatient = async (
  patient: UpsertPatientArgs
): Promise<void> => {
  const batch = writeBatch(db);
  const isEdit = Boolean(patient?.id);
  const patientDoc = isEdit
    ? doc(db, COLLECTION_NAME, patient?.id)
    : doc(collection(db, COLLECTION_NAME));
  let room: string | DocumentReference = "",
    bed: string | DocumentReference = "",
    doctors = [] as DocumentReference[];

  if (patient.doctors?.length) {
    doctors = patient.doctors.map((doctor) =>
      doc(db, DOCTORS_COLLECTION_NAME, doctor)
    );
    doctors.forEach((doctor) => {
      batch.update(doctor, {
        patients: arrayUnion(patientDoc),
      });
    });
  }
  if (patient?.room) {
    room = doc(db, ROOMS_COLLECTION_NAME, patient.room);
  }
  if (patient?.bed) {
    bed = doc(db, BEDS_COLLECTION_NAME, patient.bed);
  }

  const patientData = { ...patient, room, bed, doctors };

  if (isEdit) {
    batch.update(patientDoc, { ...patientData, updatedAt: Timestamp.now() });
    await batch.commit();
  } else {
    batch.set(patientDoc, {
      ...patientData,
      isActive: true,
      createdAt: Timestamp.now(),
    });
    await batch.commit();
    try {
      await logUp({
        type: userTypes.PATIENT,
        userTypeID: patientDoc.id,
        password: "123456",
        email: patient?.email,
        phone: patient?.phone,
        name: patient?.name,
      });
    } catch (error) {
      await deleteDoc(doc(db, COLLECTION_NAME, patientDoc.id));
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
  const doctors = await getDocs(collection(db, DOCTORS_COLLECTION_NAME));

  batch.delete(patientRef);
  doctors.docs.forEach((doc) =>
    batch.update(doc.ref, {
      patients: arrayRemove(patientRef),
    })
  );

  try {
    await Promise.all([removeUser({ userTypeID: id }), batch.commit()]);
  } catch (error) {
    throw new Error(error.message);
  }
};
