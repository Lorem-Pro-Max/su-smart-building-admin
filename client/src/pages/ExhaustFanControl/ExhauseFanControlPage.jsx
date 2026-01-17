import { useIotDevices } from "../../hooks/useIotDevices";
import Container from "@components/layout/ContentLayout/Container";
import {
  ExhaustFansControlTitleIcon,
  ExhaustFansControlButtonIcon,
} from "@assets/icons";

function ExhauseFanControlPage() {
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
      pageIcon={<ExhaustFansControlTitleIcon />}
      pageButtonIcon={<ExhaustFansControlButtonIcon />}
      pageTitle="พัดลมดูดอากาศ"
      data={data}
      onRefresh={refresh}
      config={VALVE_CONFIG}
    />
  );
}

export default ExhauseFanControlPage;
