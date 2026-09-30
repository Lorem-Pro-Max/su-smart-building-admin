import Container from "@components/layout/ContentLayout/Container";
import { DoorsControlTitleIcon, DoorsControlButtonIcon } from "@assets/icons";
import { useDoors } from "@/hooks/pageHooks/useDoors";
import DownloadReportButton from "@components/common/DownloadReport/DownloadReportButton";
import { REPORT_CONFIGS } from "@config/reports";

function DoorControlPage() {
  const { dataState, control, PageToast } = useDoors();

  return (
    <>
      {PageToast}
      <Container
        pageIcon={<DoorsControlTitleIcon />}
        pageButtonIcon={<DoorsControlButtonIcon />}
        pageTitle="ประตู"
        dataState={dataState}
        control={control}
        buildingControl={control.buildingControl}
        headerActions={
          <DownloadReportButton
            report={REPORT_CONFIGS.DOORS}
            icon={<DoorsControlTitleIcon />}
          />
        }
      />
    </>
  );
}

export default DoorControlPage;
