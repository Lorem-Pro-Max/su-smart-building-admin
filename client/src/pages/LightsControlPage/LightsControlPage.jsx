import Container from "@components/layout/ContentLayout/Container";
import { LightsControlButtonIcon, LightsControlTitleIcon } from "@assets/icons";
import { useLights } from "@/hooks/pageHooks/useLights";

function LightControlPage() {
  const { dataState, control, PageToast } = useLights();

  return (
    <>{PageToast}
    <Container
      pageIcon={<LightsControlTitleIcon />}
      pageButtonIcon={<LightsControlButtonIcon />}
      pageTitle="แสงสว่าง"
      dataState={dataState}
      control={control}
    /></>
  );
}

export default LightControlPage;
