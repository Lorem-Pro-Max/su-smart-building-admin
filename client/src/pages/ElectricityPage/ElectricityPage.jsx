import { ElectricGraphPageContainer } from "@components/layout";
import { ElectricityTitleIcon, TotalUsageIconOrange } from "@assets/icons";
import { useElectricityGraphServices } from "../../hooks/graph/useElectricGraphServices";

const displayConfig = {
  multiTabs: false,
  defaultPage: "dashboard"
};

function ElectricityPage() {
  const { graphState, fetchDailyByFloor, fetchHourlyByFloor } = useElectricityGraphServices();

  const graphService = {
    graphState,
    fetchDailyByFloor,
    fetchHourlyByFloor,
  };
  return (
    <ElectricGraphPageContainer
      pageIcon={<ElectricityTitleIcon />}
      pageTitle={"กระแสไฟฟ้า"}
      alternateTitle={"ไฟ"}
      displayConfig={displayConfig}
      graphService={graphService}
      totalUsageIcon={<TotalUsageIconOrange />}
    />
  );
}

export default ElectricityPage;
