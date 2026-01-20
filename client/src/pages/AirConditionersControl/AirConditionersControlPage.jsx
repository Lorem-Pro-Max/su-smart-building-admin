import Container from "@components/layout/ContentLayout/Container";
import {
  DoorsControlTitleIcon,
  DoorsControlButtonIcon,
  AirConditionerTemperatureButtonIcon,
} from "@assets/icons";
import { useDataFetch } from "@/hooks/useDataFetch";
import { useTemperatureControl } from "@/hooks/useTemperatureControl";
import { API_ENDPOINTS, DEVICE_CONFIGS } from "@config/devices";
import CardButtonTemperature from "./TemperatureButton";

function AirConditionersControlPage() {
  const { activePopoverId, handlePopoverChange } = useTemperatureControl();

  const { data, refresh } = useDataFetch(
    API_ENDPOINTS.DOORS,
    DEVICE_CONFIGS.DOORS.event,
  );

  return (
    <Container
      pageIcon={<DoorsControlTitleIcon />}
      pageButtonIcon={<DoorsControlButtonIcon />}
      acTempButtonIcon={<AirConditionerTemperatureButtonIcon />}
      extraColumnTitle="อุณหภูมิ"
      pageTitle="เครื่องปรับอากาศ"
      alternatePageTitle="อุณหภูมิ"
      data={data}
      onRefresh={refresh}
      config={DEVICE_CONFIGS.DOORS}
      extraColumn={
        <CardButtonTemperature
          icon={<AirConditionerTemperatureButtonIcon />}
          currentActiveId={activePopoverId}
          onToggle={handlePopoverChange}
        />
      }
    />
  );
}

export default AirConditionersControlPage;
