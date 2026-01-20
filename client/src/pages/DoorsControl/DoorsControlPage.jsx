import Container from "@components/layout/ContentLayout/Container";
import { DoorsControlTitleIcon, DoorsControlButtonIcon } from "@assets/icons";
import { useDataFetch } from "@/hooks/useDataFetch";
import { API_ENDPOINTS, DEVICE_CONFIGS } from "@config/devices";

function DoorControlPage() {
  const { data, refresh } = useDataFetch(
    API_ENDPOINTS.DOORS,
    DEVICE_CONFIGS.DOORS.event
  );

  return (
    <Container
      pageIcon={<DoorsControlTitleIcon />}
      pageButtonIcon={<DoorsControlButtonIcon />}
      pageTitle="ประตู"
      data={data}
      onRefresh={refresh}
      config={DEVICE_CONFIGS.DOORS}
    />
  );
}

export default DoorControlPage;
