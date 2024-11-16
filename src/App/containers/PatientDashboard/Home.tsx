import { useAppStore } from "@store";
import { useServiceRequest } from "@hooks";
import { useTranslation } from "react-i18next";

import { Patient } from "@types";
import { getPatient, GetPatientArgs } from "@services";

import {
  List,
  Card,
  Spinner,
  Heading,
  CardBody,
  ListItem,
} from "@chakra-ui/react";

const Home = () => {
  const { t } = useTranslation();

  // Reducer State
  const authUser = useAppStore((store) => store.auth?.user);

  // Server State
  const [_, { data, isLoading: isDataLoading }] = useServiceRequest<
    GetPatientArgs,
    Patient
  >(getPatient, {
    isInitialTrigger: true,
    isShowErrorToast: true,
    args: { id: authUser?.userTypeID as string },
  });

  return (
    <>
      <Heading mb="70px">
        {t("patient-home.title", { name: authUser?.name })}
      </Heading>
      <Card>
        <CardBody display="grid" placeItems="center">
          {isDataLoading ? (
            <Spinner />
          ) : (
            <List w="full" display="flex" justifyContent="space-around">
              <ListItem>
                {t("patient-home.bed")}:{" "}
                {data?.bed?.name || t("patient-home.N/A")}
              </ListItem>
              <ListItem>
                {t("patient-home.room")}:{" "}
                {data?.bed?.room?.name || t("patient-home.N/A")}
              </ListItem>
            </List>
          )}
        </CardBody>
      </Card>
    </>
  );
};

export default Home;
