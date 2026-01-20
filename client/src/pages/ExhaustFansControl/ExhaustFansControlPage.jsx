import { useDataFetch } from "@/hooks/useDataFetch";
import Container from "@components/layout/ContentLayout/Container";
import {
  ExhaustFansControlTitleIcon,
  ExhaustFansControlButtonIcon,
} from "@assets/icons";
import { API_ENDPOINTS, DEVICE_CONFIGS } from "@config/devices";

function ExhaustFansControlPage() {
  const { data, refresh } = useDataFetch(
    API_ENDPOINTS.DOORS,
    DEVICE_CONFIGS.DOORS.event
  );

  return (
    <Container
      pageIcon={<ExhaustFansControlTitleIcon />}
      pageButtonIcon={<ExhaustFansControlButtonIcon />}
      pageTitle="พัดลมดูดอากาศ"
      data={data}
      onRefresh={refresh}
      config={DEVICE_CONFIGS.DOORS}
    />
  );
}

export default ExhaustFansControlPage;
