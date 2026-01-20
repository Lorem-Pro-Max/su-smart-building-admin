import { useDataFetch } from "@/hooks/useDataFetch";
import Container from "@components/layout/ContentLayout/Container";
import { LightsControlButtonIcon, LightsControlTitleIcon } from "@assets/icons";
import { API_ENDPOINTS, DEVICE_CONFIGS } from "@config/devices";

function LightControlPage() {
  const { data, refresh } = useDataFetch(
    API_ENDPOINTS.DOORS,
    DEVICE_CONFIGS.DOORS.event
  );

  return (
    <Container
      pageIcon={<LightsControlTitleIcon />}
      pageButtonIcon={<LightsControlButtonIcon />}
      pageTitle="แสงสว่าง"
      data={data}
      onRefresh={refresh}
      config={DEVICE_CONFIGS.DOORS}
    />
  );
}

export default LightControlPage;
