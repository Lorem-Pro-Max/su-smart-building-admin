import { GraphPageContainer } from "@components/layout";
import { ElectricityTitleIcon, TotalUsageIconOrange } from "@assets/icons";
import { useElectricityGraphServices } from "../../hooks/graph/useElectricityGraphServices";

const displayConfig = {
  multiTabs: false,
  defaultPage: "dashboard"
};

function ElectricityPage() {
  const { graphState, fetchDaily, fetchHourly } = useElectricityGraphServices();

  const graphService = {
    graphState,
    fetchDaily,
    fetchHourly,
  };
  return (
    <GraphPageContainer
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
