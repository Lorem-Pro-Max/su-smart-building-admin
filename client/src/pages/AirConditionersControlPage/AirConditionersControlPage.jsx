import Container from "@components/layout/ContentLayout/Container";
import {
  AirConditionerTitleIcon,
  AirConditionerButtonIcon,
  AirConditionerTemperatureButtonIcon,
} from "@assets/icons";
import { useAc } from "@hooks/pageHooks/useAc";

function AirConditionersControlPage() {
  const { dataState, control, tempControl, contextHolder } = useAc();

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
        extraColumn={{
          device: "ac",
          title: "อุณหภูมิ",
          extraValue: "temp",
          extraControl: tempControl,
        }}
      />
    </>
  );
}

export default AirConditionersControlPage;
