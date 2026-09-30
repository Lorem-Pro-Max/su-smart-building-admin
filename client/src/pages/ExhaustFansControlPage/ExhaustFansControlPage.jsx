import Container from "@components/layout/ContentLayout/Container";
import {
  ExhaustFansControlTitleIcon,
  ExhaustFansControlButtonIcon,
} from "@assets/icons";
import { useExhaustFans } from "@hooks/pageHooks/useExhaustFans";
import DownloadReportButton from "@components/common/DownloadReport/DownloadReportButton";
import { REPORT_CONFIGS } from "@config/reports";

function ExhaustFansControlPage() {
  const { dataState, control, PageToast } = useExhaustFans();

  return (
    <>
      {PageToast}
      <Container
        pageIcon={<ExhaustFansControlTitleIcon />}
        pageButtonIcon={<ExhaustFansControlButtonIcon />}
        pageTitle="พัดลมดูดอากาศ"
        dataState={dataState}
        control={control}
        buildingControl={control.buildingControl}
        headerActions={
          <DownloadReportButton
            report={REPORT_CONFIGS.EXHAUST_FANS}
            icon={<ExhaustFansControlTitleIcon />}
          />
        }
      />
    </>
  );
}

export default ExhaustFansControlPage;
