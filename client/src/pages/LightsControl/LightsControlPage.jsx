import { useIotDevices } from "../../hooks/useIotDevices";
import Container from "@components/layout/ContentLayout/Container";
import { LightsControlButtonIcon, LightsControlTitleIcon } from "@assets/icons";

function LightControlPage() {
  const VALVE_CONFIG = {
    actions: { on: "open", off: "close" },
    statusOn: "open",
    statusOff: "closed",
  };

  const { data, refresh } = useIotDevices(
    "http://localhost:4000/api/status/valves",
    "valve_update"
  );

  return (
    <Container
      pageIcon={<LightsControlTitleIcon />}
      pageButtonIcon={<LightsControlButtonIcon />}
      pageTitle="แสงสว่าง"
      data={data}
      onRefresh={refresh}
      config={VALVE_CONFIG}
    />
  );
}

export default LightControlPage;
