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
import {
  getDoctors,
  COLLECTION_NAME as DOCTORS_COLLECTION_NAME,
} from "./doctors";
import { logUp } from "./auth";
import { db } from "./firebase";
import paginator from "./paginator";
import { buildOptionModel } from "@helpers";
import { PaginatorResponse, Patient, Doctor, Room, Bed } from "@types";
import { COLLECTION_NAME as BEDS_COLLECTION_NAME, getBeds } from "./beds";
import { getRooms, COLLECTION_NAME as ROOMS_COLLECTION_NAME } from "./rooms";

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
        const bedDoc = await getDoc(
          doc(db, BEDS_COLLECTION_NAME, patient.bed.id)
        );
        bed = { id: bedDoc.id, ...bedDoc?.data() } as Bed;
      }
      return { ...patient, room, bed, doctors };
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

export const savePatient = async ({
  doctors,
  ...patient
}: UpsertPatientArgs): Promise<void> => {
  let room: string | DocumentReference = "",
    bed: string | DocumentReference = "",
    doctorsArr = [] as DocumentReference[];
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
  if (patient.room) {
    const roomDoc = await getDoc(doc(db, ROOMS_COLLECTION_NAME, patient.room));
    room = roomDoc?.ref;
  }
  if (patient.bed) {
    const bedDoc = await getDoc(doc(db, BEDS_COLLECTION_NAME, patient.bed));
    bed = bedDoc?.ref;
  }
  await addDoc(collection(db, COLLECTION_NAME), {
    ...patient,
    room,
    bed,
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
  let room: string | DocumentReference = "",
    bed: string | DocumentReference = "",
    doctorsArr = [] as DocumentReference[];
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
  if (patient.room) {
    const roomDoc = await getDoc(doc(db, ROOMS_COLLECTION_NAME, patient.room));
    room = roomDoc?.ref;
  }
  if (patient.bed) {
    const bedDoc = await getDoc(doc(db, BEDS_COLLECTION_NAME, patient.bed));
    bed = bedDoc?.ref;
  }
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...patient,
    room,
    bed,
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
