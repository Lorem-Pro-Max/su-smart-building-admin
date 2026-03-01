import { GraphPageContainer } from "@components/layout";
import { ElectricityTitleIcon, TotalUsageIconOrange } from "@assets/icons";
import { useElectricity } from "@hooks/pageHooks/useElectricity";

const displayConfig = {
  multiTabs: false,
  defaultPage: "dashboard"
};

function ElectricityPage() {
  const { graphService } = useElectricity();
  return (
    <p>ElectricityPage</p>
  );
}

export default ElectricityPage;
