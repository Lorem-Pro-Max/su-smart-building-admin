import TabsMenu from "./TabsMenu";
import PageHeader from "./PageHeader";
import RoomControlMenu from "./RoomControlMenu";

function Container({ pageIcon, pageTitle }) {
  return (
    <PageHeader pageIcon={pageIcon} pageTitle={pageTitle}>
      <TabsMenu>
        {(floorNum) => <RoomControlMenu floor={floorNum} title={pageTitle} />}
      </TabsMenu>
    </PageHeader>
  );
}

export default Container;
