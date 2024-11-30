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
  getCountFromServer,
} from "firebase/firestore";
import Store from "@store";
import { logUp } from "./auth";
import { db } from "./firebase";
import paginator from "./paginator";
import { userTypes } from "@constants";
import { getPatient } from "./patients";
import { getHospital } from "./hospitals";
import { FirebaseError } from "firebase/app";
import { removeUser, toggleActiveStatus } from "./users";
import { PaginatorResponse, Doctor, Patient, Appointment } from "@types";
import { COLLECTION_NAME as APPOINTMENTS_COLLECTION_NAME } from "./appointments";

export const COLLECTION_NAME = "doctors";
const formatDoctor = async (
  doctor: Doctor & { hospitalID: string }
): Promise<Doctor> => {
  const hospital = await getHospital({ id: doctor?.hospitalID });
  const appointments = await getDoctorAppointments({ id: doctor.id });
  return { ...doctor, hospital, appointments } as Doctor;
};

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
  const doctorsPromises = doctors.items.map(formatDoctor);
  const items = await Promise.all(doctorsPromises);
  return { ...doctors, items };
};

export interface GetDoctorArgs {
  id: string;
}

export const getDoctor = async ({ id }: GetDoctorArgs): Promise<Doctor> => {
  const doctorDoc = await getDoc(doc(db, COLLECTION_NAME, id));
  const doctor = { id, ...doctorDoc.data() } as Doctor;
  return await formatDoctor(doctor);
};

interface GetDoctorAppointmentsArgs {
  id: string;
}

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
  const hospitalID = Store.auth?.user?.hospital?.id;
  const doctorData = { ...doctor, hospitalID };

  if (isEdit) {
    await updateDoc(doc(db, COLLECTION_NAME, doctor?.id), {
      ...doctorData,
      updatedAt: Timestamp.now(),
    });
  } else {
    if (!Store.auth?.user?.hospital.canAddNewUser) {
      throw new Error(
        "Can't create a new doctor. You have reached to limit of this plan."
      );
    }

    const newDoc = await addDoc(collection(db, COLLECTION_NAME), {
      ...doctorData,
      isActive: true,
      createdAt: Timestamp.now(),
    });

    if (!newDoc?.id) {
      throw new Error("toast.default-error-desc");
    }

    try {
      await logUp({
        type: userTypes.DOCTOR,
        userTypeID: newDoc.id,
        password: "123456",
        email: doctor?.email,
        phone: doctor?.phone,
        name: doctor?.name,
      });
    } catch (error) {
      await deleteDoc(doc(db, COLLECTION_NAME, newDoc.id));
      throw new Error(
        (error as FirebaseError)?.code ||
          (error as FirebaseError)?.message ||
          "toast.default-error-desc"
      );
    }
  }
};

export type ToggleDoctorStatusArgs = {
  id: string;
};
export const toggleDoctorStatus = async ({ id }: ToggleDoctorStatusArgs) => {
  const doctorAppointmentsSnapshot = await getCountFromServer(
    query(
      collection(db, APPOINTMENTS_COLLECTION_NAME),
      where("doctor", "==", doc(db, COLLECTION_NAME, id))
    )
  );
  if (doctorAppointmentsSnapshot.data().count) {
    throw new Error("Can't deactivate a doctor with appointments");
  }

  await toggleActiveStatus({ id, collectionName: COLLECTION_NAME });
};

export type RemoveDoctorArgs = {
  id: string;
};
export const removeDoctor = async ({ id }: RemoveDoctorArgs) => {
  const doctorAppointmentsSnapshot = await getCountFromServer(
    query(
      collection(db, APPOINTMENTS_COLLECTION_NAME),
      where("doctor", "==", id)
    )
  );
  if (doctorAppointmentsSnapshot.data().count) {
    throw new Error("Can't delete a doctor with appointments");
  }

  await Promise.all([
    deleteDoc(doc(db, COLLECTION_NAME, id)),
    removeUser({ userTypeID: id }),
  ]);
};
