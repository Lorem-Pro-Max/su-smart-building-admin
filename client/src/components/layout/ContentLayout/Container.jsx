import TabsMenu from "./TabsMenu";
import PageHeader from "./PageHeader";
import RoomHeaderMenu from "./RoomHeaderMenu";

function Container({
  pageIcon,
  pageTitle,
  menuTitle,
  closeButtonText,
  openButtontext,
}) {
  return (
    <PageHeader pageIcon={pageIcon} pageTitle={pageTitle}>
      <TabsMenu>
        {(floorNum) => (
          <RoomHeaderMenu
            floor={floorNum}
            title={menuTitle}
            closeButtonText={closeButtonText}
            openButtontext={openButtontext}
          />
        )}
      </TabsMenu>
    </PageHeader>
  );
}

export default Container;
