import { useDataFetch } from "@/hooks/useDataFetch";
import Container from "@components/layout/ContentLayout/Container";
import { ValvesControlTitleIcon, ValvesControlButtonIcon } from "@assets/icons";
import { API_ENDPOINTS, DEVICE_CONFIGS } from "@config/devices";

function ValvesControlPage() {
  const { data, refresh } = useDataFetch(
    API_ENDPOINTS.VALVES,
    DEVICE_CONFIGS.VALVES.event
  );

  return (
    <Container
      pageIcon={<ValvesControlTitleIcon />}
      pageButtonIcon={<ValvesControlButtonIcon />}
      pageTitle="น้ำ"
      data={data}
      onRefresh={refresh}
      config={DEVICE_CONFIGS.VALVES}
    />
  );
}

export default ValvesControlPage;
