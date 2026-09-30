import { GraphPageContainer } from "@components/layout";
import { useValves } from "@/hooks/pageHooks/useValves";
import {
  ValvesControlTitleIcon,
  ValvesControlButtonIcon,
  TotalUsageIconBlue,
} from "@assets/icons";
import DownloadReportButton from "@components/common/DownloadReport/DownloadReportButton";
import { REPORT_CONFIGS } from "@config/reports";

const displayConfig = {
  multiTabs: true,
  defaultPage: "control",
};

function ValvesControlPage() {
  const { dataState, control, graphService, PageToast } = useValves();

  return (
    <>
      {PageToast}
      <GraphPageContainer
        pageIcon={<ValvesControlTitleIcon />}
        pageButtonIcon={<ValvesControlButtonIcon />}
        totalUsageIcon={<TotalUsageIconBlue />}
        pageTitle="น้ำ"
        dataState={dataState}
        control={control}
        displayConfig={displayConfig}
        graphService={graphService}
        headerActions={
          <DownloadReportButton
            report={REPORT_CONFIGS.WATER}
            icon={<ValvesControlTitleIcon />}
          />
        }
      />
    </>
  );
}

export default ValvesControlPage;
