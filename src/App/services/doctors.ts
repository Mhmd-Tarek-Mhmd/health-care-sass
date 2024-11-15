import {
  doc,
  where,
  query,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  Timestamp,
  collection,
} from "firebase/firestore";
import {
  GetDoctorAppointmentsArgs,
  COLLECTION_NAME as APPOINTMENTS_COLLECTION_NAME,
} from "./appointments";
import Store from "@store";
import { logUp } from "./auth";
import { db } from "./firebase";
import paginator from "./paginator";
import { userTypes } from "@constants";
import { getPatient } from "./patients";
import { getHospital } from "./hospitals";
import { removeUser, toggleActiveStatus } from "./users";
import { PaginatorResponse, Doctor, Patient, Appointment } from "@types";

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
    const doctorData = await getDoctor({ id: doctor.id });
    return doctorData;
  });

  const items = await Promise.all(doctorsPromises);
  return { ...doctors, items };
};

export interface GetDoctorArgs {
  id: string;
}

export const getDoctor = async ({ id }: GetDoctorArgs): Promise<Doctor> => {
  const hospitalID = Store.auth?.user?.hospital.id as string;
  const doctorDoc = await getDoc(doc(db, COLLECTION_NAME, id));
  const hospital = await getHospital({ id: hospitalID });
  const appointments = await getDoctorAppointments({ id });
  return { id, ...doctorDoc?.data(), hospital, appointments } as Doctor;
};

export const getDoctorAppointments = async ({
  id,
}: GetDoctorAppointmentsArgs): Promise<Appointment[]> => {
  const doctorAppointments = await getDocs(
    query(
      collection(db, APPOINTMENTS_COLLECTION_NAME),
      where("doctor", "==", id)
    )
  );
  const appointments = doctorAppointments.docs.map((doc) => {
    const appointment = { id: doc.id, ...doc.data() } as Appointment;
    return appointment;
  });

  return appointments;
};

export const getDoctorsPatients = async () => {
  const id = Store.auth?.user?.userTypeID as string;
  const appointments = await getDoctorAppointments({ id });

  let patientsPromises: Promise<Patient>[] = [];
  appointments?.forEach((appointment) => {
    appointment.patients.forEach((patient) => {
      patientsPromises.push(getPatient({ id: patient as unknown as string }));
    });
  });

  const items = await Promise.all(patientsPromises);
  return { items };
};

export interface UpsertDoctorArgs extends Omit<Doctor, "appointments"> {}

export const upsertDoctor = async (doctor: UpsertDoctorArgs): Promise<void> => {
  const isEdit = Boolean(doctor?.id);
  const hospitalID = Store.auth?.user?.hospital.id;
  const doctorData = { ...doctor, hospitalID, appointments: [] };

  if (isEdit) {
    await updateDoc(doc(db, COLLECTION_NAME, doctor?.id), {
      ...doctorData,
      updatedAt: Timestamp.now(),
    });
  } else {
    const doctorCollection = collection(db, COLLECTION_NAME);
    const doctorRef = doc(doctorCollection);
    await addDoc(doctorCollection, {
      ...doctorData,
      isActive: true,
      createdAt: Timestamp.now(),
    });

    try {
      await logUp({
        type: userTypes.DOCTOR,
        userTypeID: doctorRef.id,
        password: "123456",
        email: doctor?.email,
        phone: doctor?.phone,
        name: doctor?.name,
      });
    } catch (error) {
      await deleteDoc(doc(db, COLLECTION_NAME, doctorRef.id));
      throw new Error(error.message);
    }
  }
};

export type ToggleDoctorStatusArgs = {
  id: string;
};
export const toggleDoctorStatus = async ({ id }: ToggleDoctorStatusArgs) => {
  const appointments = await getDoctorAppointments({ id });
  if (appointments?.length) {
    throw new Error("Can't suspend a doctor with appointments");
  }
  await toggleActiveStatus({ id, collectionName: COLLECTION_NAME });
};

export type RemoveDoctorArgs = {
  id: string;
};
export const removeDoctor = async ({ id }: RemoveDoctorArgs) => {
  const appointments = await getDoctorAppointments({ id });
  if (appointments?.length) {
    throw new Error("Can't delete a doctor with appointments");
  }

  await Promise.all([
    deleteDoc(doc(db, COLLECTION_NAME, id)),
    removeUser({ userTypeID: id }),
  ]);
};
