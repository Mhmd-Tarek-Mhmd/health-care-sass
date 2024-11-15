import {
  doc,
  where,
  getDoc,
  deleteDoc,
  Timestamp,
  collection,
  arrayUnion,
  writeBatch,
} from "firebase/firestore";
import Store from "@store";
import { db } from "./firebase";
import paginator from "./paginator";
import { userTypes } from "@constants";
import { buildOptionModel } from "@helpers";
import { getDoctor, getDoctors } from "./doctors";
import { getPatient, getPatients } from "./patients";
import { PaginatorResponse, Appointment, Patient } from "@types";
import { COLLECTION_NAME as PATIENTS_COLLECTION_NAME } from "./patients";

export const COLLECTION_NAME = "appointments";

export interface GetAppointmentsArgs {
  pageSize: number;
  pageNumber: number;
}
export const getAppointments = async ({
  pageSize,
  pageNumber,
}: GetAppointmentsArgs): Promise<PaginatorResponse<Appointment>> => {
  const authUser = Store.auth?.user;
  const isDoctor = authUser?.type === userTypes.DOCTOR;
  const filters = [
    where("hospitalID", "==", authUser?.hospital.id),
    ...(isDoctor ? [where("doctor", "==", authUser.userTypeID)] : []),
  ];
  const appointments = await paginator<Appointment>({
    filters,
    pageSize,
    pageNumber,
    orderByField: "from",
    collectionName: COLLECTION_NAME,
  });
  const appointmentsPromises = appointments.items.map((appointment) =>
    getAppointment({ id: appointment.id })
  );

  const items = await Promise.all(appointmentsPromises);
  return { ...appointments, items };
};

export interface GetAppointmentArgs {
  id: string;
}

export const getAppointment = async ({
  id,
}: GetAppointmentArgs): Promise<Appointment> => {
  const appointmentDoc = await getDoc(doc(db, COLLECTION_NAME, id));
  const appointment = { id, ...appointmentDoc?.data() } as Appointment;

  // Doctor
  const doctor = await getDoctor({
    id: appointment.doctor as unknown as string,
  });

  // Patients
  let patients: Patient[] = [];
  if (appointment.patients.length) {
    const patientsPromises = appointment.patients.map((patient) =>
      getPatient({ id: patient as unknown as string })
    );

    patients = await Promise.all(patientsPromises);
  }

  return { ...appointment, doctor, patients };
};

export const getAppointmentModalOptions = async () => {
  const res = await Promise.all([
    getDoctors({ pageSize: 999, pageNumber: 1 }),
    getPatients({ pageSize: 999, pageNumber: 1 }),
  ]);

  return {
    doctors: res[0].items.map(buildOptionModel),
    patients: res[1].items.map(buildOptionModel),
  };
};

export interface UpsertAppointmentArgs {
  to: Date;
  from: Date;
  id: string;
  doctor: string;
  patients: string[];
}

export const upsertAppointment = async ({
  id,
  ...appointment
}: UpsertAppointmentArgs): Promise<void> => {
  const batch = writeBatch(db);
  const isEdit = Boolean(id);
  const appointmentRef = isEdit
    ? doc(db, COLLECTION_NAME, id)
    : doc(collection(db, COLLECTION_NAME));
  const data = {
    ...appointment,
    doctor: appointment.doctor,
    to: Timestamp.fromDate(appointment.to),
    from: Timestamp.fromDate(appointment.from),
    hospitalID: Store.auth?.user?.hospital.id,
  };

  if (appointment.patients.length) {
    appointment.patients.forEach(async (patient) => {
      const hospitalID = Store.auth?.user?.hospital.id;
      const patientRef = doc(db, PATIENTS_COLLECTION_NAME, patient);
      batch.update(patientRef, { hospitals: arrayUnion(hospitalID) });
    });
  }

  if (isEdit) {
    batch.update(appointmentRef, { ...data, updatedAt: Timestamp.now() });
  } else {
    batch.set(appointmentRef, { ...data, createdAt: Timestamp.now() });
  }

  await batch.commit();
};

export interface RemoveAppointmentArgs {
  id: string;
}

export const removeAppointment = async ({ id }: RemoveAppointmentArgs) => {
  // TODO: send an email to patients
  await deleteDoc(doc(db, COLLECTION_NAME, id));
};
