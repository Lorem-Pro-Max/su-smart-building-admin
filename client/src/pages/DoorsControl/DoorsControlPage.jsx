import Container from "@components/layout/ContentLayout/Container";
import {
  DoorsControlTitleIcon,
  DoorsControlButtonIcon,
} from "../../assets/icons";
import { useIotDevices } from "../../hooks/useIotDevices";

const DOOR_CONFIG = {
  actions: { on: "unlock", off: "lock" },
  statusOn: "unlocked",
  statusOff: "locked",
};

function DoorControlPage() {
  const { data, refresh } = useIotDevices(
    "http://localhost:4000/api/status/doors",
    "door_update"
  );

  return (
    <Container
      pageIcon={<DoorsControlTitleIcon />}
      pageButtonIcon={<DoorsControlButtonIcon />}
      pageTitle="ประตู"
      data={data}
      onRefresh={refresh}
      config={DOOR_CONFIG}
    />
  );
}

export default DoorControlPage;
