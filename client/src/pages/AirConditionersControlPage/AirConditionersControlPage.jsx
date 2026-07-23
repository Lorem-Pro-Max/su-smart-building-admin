import Container from "@components/layout/ContentLayout/Container";
import {
  AirConditionerTitleIcon,
  AirConditionerButtonIcon,
  AirConditionerTemperatureButtonIcon,
} from "@assets/icons";
import { useAc } from "@hooks/pageHooks/useAc";

function AirConditionersControlPage() {
  const { dataState, control, tempControl, contextHolder, PageToast } = useAc();

  return (
    <>
      {contextHolder}
      <Container
        pageIcon={<AirConditionerTitleIcon />}
        pageButtonIcon={<AirConditionerButtonIcon />}
        acTempButtonIcon={<AirConditionerTemperatureButtonIcon />}
        pageTitle="เครื่องปรับอากาศ"
        alternatePageTitle="อุณหภูมิ"
        dataState={dataState}
        control={control}
        buildingControl={control.buildingControl}
        extraColumn={{
          device: "ac",
          title: "อุณหภูมิ",
          extraValue: "temp",
          extraControl: tempControl,
        }}
      />
      {PageToast}
    </>
  );
}

export default AirConditionersControlPage;
