import { Tabs } from "antd";
import { DoorControlConfig } from "@styles/themes/doorControlTheme";
import { ConfigProvider } from "antd";

function TabsMenu({ children }) {
  const floors = [1, 2, 3, 4, 5];
  const items = floors.map((floorNum) => ({
    key: `floor-${floorNum}`,
    label: (
      <div className="leading-8 font-normal tracking-figma">
        ชั้นที่ {floorNum}
      </div>
    ),
    children: children(floorNum),
  }));

  return (
    <ConfigProvider theme={DoorControlConfig}>
      <Tabs
        defaultActiveKey="floor-1"
        items={items}
        className="door-tabs w-full h-14"
      />
    </ConfigProvider>
  );
}

export default TabsMenu;
