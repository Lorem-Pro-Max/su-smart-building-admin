import Container from "@components/layout/ContentLayout/Container";
import { DoorsControlTitleIcon, DoorsControlButtonIcon } from "@assets/icons";
import { useDoors } from "@/hooks/pageHooks/useDoors";

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
      />
    </>
  );
}

export default DoorControlPage;
