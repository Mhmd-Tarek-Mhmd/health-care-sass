import { useServiceRequest } from "@hooks";

import { PatientsList } from "../SharedLists";
import { getDoctorsPatients } from "@services";

const Patients = () => {
  // Server State
  const service = useServiceRequest(getDoctorsPatients, {
    isInitialTrigger: true,
    isShowErrorToast: true,
  });

  return <PatientsList doctorsPatientsService={service} />;
};

export default Patients;
