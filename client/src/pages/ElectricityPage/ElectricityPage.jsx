import { GraphPageContainer } from "@components/layout";
import { ElectricityTitleIcon, TotalUsageIconOrange } from "@assets/icons";
import { useElectricity } from "@hooks/pageHooks/useElectricity";

function ElectricityPage() {
  const { graphService } = useElectricity();
  const displayConfig = {
    multiTabs: false,
    hasRooms: true,
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
