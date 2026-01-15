import { useIotDevices } from "../hooks/useIotDevices";
import Container from "@components/layout/ContentLayout/Container";
import { ValvesControlIcon, ValvesControlButtonIcon } from "@assets/icons";

const VALVE_CONFIG = {
  actions: { on: "open", off: "close" },
  statusOn: "open",
  statusOff: "closed",
};

function WaterControlPage() {
  const { data, refresh } = useIotDevices(
    "http://localhost:3000/api/status/valves",
    "valve_update"
  );

  return (
    <Container
      pageIcon={<ValvesControlIcon />}
      pageButtonIcon={<ValvesControlButtonIcon  />}
      pageTitle="วาล์ว"
      data={data}
      onRefresh={refresh}
      config={VALVE_CONFIG}
    />
  );
}

export default WaterControlPage;
