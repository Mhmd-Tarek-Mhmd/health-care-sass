import {
  doc,
  query,
  where,
  getDoc,
  addDoc,
  getDocs,
  updateDoc,
  Timestamp,
  deleteDoc,
  collection,
  writeBatch,
  DocumentReference,
  getCountFromServer,
} from "firebase/firestore";
import { logUp } from "./auth";
import { db } from "./firebase";
import paginator from "./paginator";
import { userTypes } from "@constants";
import { removeUser, toggleActiveStatus } from "./users";
import { PaginatorResponse, Hospital, Plan } from "@types";
import { COLLECTION_NAME as BEDS_COLLECTION_NAME } from "./beds";
import { COLLECTION_NAME as PLANS_COLLECTION_NAME } from "./plans";
import { COLLECTION_NAME as ROOMS_COLLECTION_NAME } from "./rooms";
import { COLLECTION_NAME as NURSES_COLLECTION_NAME } from "./nurses";
import { COLLECTION_NAME as DOCTORS_COLLECTION_NAME } from "./doctors";
import { COLLECTION_NAME as PATIENTS_COLLECTION_NAME } from "./patients";
import { COLLECTION_NAME as MEDICINES_COLLECTION_NAME } from "./medicines";
import { COLLECTION_NAME as APPOINTMENTS_COLLECTION_NAME } from "./appointments";

export const COLLECTION_NAME = "hospitals";

export interface GetHospitalsArgs {
  pageSize: number;
  pageNumber: number;
}
export const getHospitals = async ({
  pageSize,
  pageNumber,
}: GetHospitalsArgs): Promise<PaginatorResponse<Hospital>> => {
  const hospitals = await paginator<Hospital>({
    pageSize,
    pageNumber,
    collectionName: COLLECTION_NAME,
  });
  const hospitalsPromises = hospitals.items.map((hospital) =>
    getHospital({ id: hospital.id })
  );

  const items = await Promise.all(hospitalsPromises);
  return { ...hospitals, items };
};

export interface GetHospitalArgs {
  id: string;
}

export const getHospital = async ({
  id,
}: GetHospitalArgs): Promise<Hospital> => {
  const hospitalDoc = await getDoc(doc(db, COLLECTION_NAME, id));
  const hospital = hospitalDoc.data();
  const planDoc = await getDoc(hospital?.plan as DocumentReference);
  const plan = { id: planDoc.id, ...planDoc?.data() } as Plan;
  return { id, ...hospital, plan } as Hospital;
};

export const saveHospital = async ({
  plan,
  ...hospital
}: Hospital): Promise<void> => {
  const planRef = doc(db, PLANS_COLLECTION_NAME, plan as unknown as string);
  const newDoc = await addDoc(collection(db, COLLECTION_NAME), {
    ...hospital,
    isActive: true,
    plan: planRef,
    createdAt: Timestamp.now(),
  });

  if (!newDoc?.id) {
    throw new Error("toast.default-error-desc");
  }

  try {
    await logUp({
      type: userTypes.ADMIN,
      userTypeID: newDoc.id,
      password: "123456",
      email: hospital?.email,
      phone: hospital?.phone,
      name: hospital?.name,
    });
  } catch (error) {
    await deleteDoc(doc(db, COLLECTION_NAME, newDoc.id));
    throw new Error("toast.default-error-desc");
  }
};

export const updateHospital = async ({
  id,
  plan,
  ...hospital
}: Hospital): Promise<void> => {
  const planDoc = await getDoc(
    doc(db, PLANS_COLLECTION_NAME, plan as unknown as string)
  );
  await updateDoc(doc(db, COLLECTION_NAME, id), {
    ...hospital,
    plan: planDoc.ref,
    updatedAt: Timestamp.now(),
  });
};

export type ToggleHospitalStatusArgs = {
  id: string;
};
export const toggleHospitalStatus = async ({
  id,
}: ToggleHospitalStatusArgs) => {
  const hospitalPatientsSnapshot = await getCountFromServer(
    query(
      collection(db, PATIENTS_COLLECTION_NAME),
      where("hospitalID", "==", id)
    )
  );
  if (hospitalPatientsSnapshot.data().count) {
    throw new Error("Can't deactivate an hospital have patients.");
  }

  const hospitalDoctorsSnapshot = await getCountFromServer(
    query(
      collection(db, DOCTORS_COLLECTION_NAME),
      where("hospitalID", "==", id)
    )
  );
  if (hospitalDoctorsSnapshot.data().count) {
    throw new Error("Can't deactivate an hospital have doctors.");
  }

  const hospitalNursesSnapshot = await getCountFromServer(
    query(collection(db, NURSES_COLLECTION_NAME), where("hospitalID", "==", id))
  );
  if (hospitalNursesSnapshot.data().count) {
    throw new Error("Can't deactivate an hospital have nurses.");
  }

  await toggleActiveStatus({ id, collectionName: COLLECTION_NAME });
};

export type RemoveHospitalArgs = {
  id: string;
};
export const removeHospital = async ({ id }: RemoveHospitalArgs) => {
  const hospitalPatientsSnapshot = await getCountFromServer(
    query(
      collection(db, PATIENTS_COLLECTION_NAME),
      where("hospitalID", "==", id)
    )
  );
  if (hospitalPatientsSnapshot.data().count) {
    throw new Error("Can't remove an hospital have patients.");
  }

  const hospitalDoctorsSnapshot = await getCountFromServer(
    query(
      collection(db, DOCTORS_COLLECTION_NAME),
      where("hospitalID", "==", id)
    )
  );
  if (hospitalDoctorsSnapshot.data().count) {
    throw new Error("Can't remove an hospital have doctors.");
  }

  const hospitalNursesSnapshot = await getCountFromServer(
    query(collection(db, NURSES_COLLECTION_NAME), where("hospitalID", "==", id))
  );
  if (hospitalNursesSnapshot.data().count) {
    throw new Error("Can't remove an hospital have nurses.");
  }

  const batch = writeBatch(db);
  const hospitalRef = doc(db, COLLECTION_NAME, id);
  const beds = await getDocs(
    query(collection(db, BEDS_COLLECTION_NAME), where("hospitalID", "==", id))
  );
  const rooms = await getDocs(
    query(collection(db, ROOMS_COLLECTION_NAME), where("hospitalID", "==", id))
  );
  const medicines = await getDocs(
    query(
      collection(db, MEDICINES_COLLECTION_NAME),
      where("hospitalID", "==", id)
    )
  );
  const appointments = await getDocs(
    query(
      collection(db, APPOINTMENTS_COLLECTION_NAME),
      where("hospitalID", "==", id)
    )
  );

  batch.delete(hospitalRef);
  beds.docs.forEach((doc) => batch.delete(doc.ref));
  rooms.docs.forEach((doc) => batch.delete(doc.ref));
  medicines.docs.forEach((doc) => batch.delete(doc.ref));
  appointments.docs.forEach((doc) => batch.delete(doc.ref));

  await Promise.all([removeUser({ userTypeID: id }), batch.commit()]);
};
