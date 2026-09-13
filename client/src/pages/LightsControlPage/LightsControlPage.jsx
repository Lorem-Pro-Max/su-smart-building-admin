import Container from "@components/layout/ContentLayout/Container";
import { LightsControlButtonIcon, LightsControlTitleIcon } from "@assets/icons";
import { useLights } from "@/hooks/pageHooks/useLights";
import DownloadReportButton from "@components/common/DownloadReport/DownloadReportButton";
import { REPORT_CONFIGS } from "@config/reports";

function LightControlPage() {
  const { dataState, control, PageToast } = useLights();

  return (
    <>
      {PageToast}
      <Container
        pageIcon={<LightsControlTitleIcon />}
        pageButtonIcon={<LightsControlButtonIcon />}
        pageTitle="แสงสว่าง"
        dataState={dataState}
        control={control}
        buildingControl={control.buildingControl}
        headerActions={
          <DownloadReportButton
            report={REPORT_CONFIGS.LIGHTS}
            icon={<LightsControlTitleIcon />}
          />
        }
      />
    </>
  );
}

export default LightControlPage;
