import Container from "@components/layout/ContentLayout/Container";
import {
  AirConditionerTitleIcon,
  AirConditionerButtonIcon,
  AirConditionerTemperatureButtonIcon,
} from "@assets/icons";
// import { useTemperatureControl } from "@/hooks/useTemperatureControl";
import TemperatureButton from "@components/utils/TemperatureButton";
import { useAc } from "@hooks/pageHooks/useAc";

function AirConditionersControlPage() {
  const { dataState, control } = useAc();

  return (
    <Container
      pageIcon={<AirConditionerTitleIcon />}
      pageButtonIcon={<AirConditionerButtonIcon />}
      acTempButtonIcon={<AirConditionerTemperatureButtonIcon />}
      extraColumnTitle="อุณหภูมิ"
      pageTitle="เครื่องปรับอากาศ"
      alternatePageTitle="อุณหภูมิ"
      dataState={dataState}
      control={control}
      extraColumn={
        <TemperatureButton
          icon={<AirConditionerTemperatureButtonIcon />}
          // currentActiveId={activePopoverId}
          // onToggle={handlePopoverChange}
        />
      }
    />
  );
}

export default AirConditionersControlPage;
