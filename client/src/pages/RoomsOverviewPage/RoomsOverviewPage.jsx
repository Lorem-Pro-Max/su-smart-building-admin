import { PageHeader, TabsMenu, FloorDeviceSummary } from "@components/layout";
import RoomOverviewList from "@components/layout/ContentLayout/RoomOverviewList";
import {
  RoomsOverviewTitleIcon,
  RoomsOverviewDoorsIcon,
  RoomsOverviewFansIcon,
  RoomsOverviewLightsIcon,
  RoomsOverviewAcIcon,
} from "@assets/icons";
import { useRoomsOverview } from "@hooks/pageHooks/useRoomsOverview";
import { DEVICE_CONFIGS } from "@config/devices";

function RoomsOverviewPage() {
  const { doorsData, fansData, lightsData, acData, PageToasts } =
    useRoomsOverview();

  const groups = [
    {
      key: "doors",
      label: DEVICE_CONFIGS.DOORS.label,
      Icon: RoomsOverviewDoorsIcon,
      data: doorsData,
    },
    {
      key: "fans",
      label: DEVICE_CONFIGS.EXHAUST_FANS.label,
      Icon: RoomsOverviewFansIcon,
      data: fansData,
    },
    {
      key: "lights",
      label: DEVICE_CONFIGS.LIGHTS.label,
      Icon: RoomsOverviewLightsIcon,
      data: lightsData,
    },
    {
      key: "ac",
      label: DEVICE_CONFIGS.AC.label,
      Icon: RoomsOverviewAcIcon,
      data: acData,
    },
  ];

  return (
    <>
      {PageToasts}
      <PageHeader pageIcon={<RoomsOverviewTitleIcon />} pageTitle="ห้องภายในอาคาร">
        <TabsMenu>
          {(floorNum) => (
            <div className="flex flex-col gap-6 pb-6">
              <FloorDeviceSummary floorNum={floorNum} groups={groups} />
              <RoomOverviewList floorNum={floorNum} groups={groups} />
            </div>
          )}
        </TabsMenu>
      </PageHeader>
    </>
  );
}

export default RoomsOverviewPage;
