import { GraphPageContainer } from "@components/layout";
import { useValves } from "@/hooks/pageHooks/useValves";
import {
  ValvesControlTitleIcon,
  ValvesControlButtonIcon,
  TotalUsageIconBlue,
} from "@assets/icons";

const displayConfig = {
  multiTabs: true,
  defaultPage: "control",
};

function ValvesControlPage() {
  const { dataState, control, graphService } = useValves();

  return (
    <GraphPageContainer
      pageIcon={<ValvesControlTitleIcon />}
      pageButtonIcon={<ValvesControlButtonIcon />}
      totalUsageIcon={<TotalUsageIconBlue />}
      pageTitle="น้ำ"
      dataState={dataState}
      control={control}
      displayConfig={displayConfig}
      graphService={graphService}
    />
  );
}

export default ValvesControlPage;
