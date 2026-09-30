import { Tabs } from "antd";
import { ContentLayoutTheme } from "@styles/themes/contentLayoutTheme";
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
    children: typeof children === "function" ? children(floorNum) : children,
  }));

  return (
    <ConfigProvider theme={ContentLayoutTheme}>
      <Tabs
        defaultActiveKey="floor-1"
        items={items}
        className="content-layout-tabs w-full h-14 "
      />
    </ConfigProvider>
  );
}

export default TabsMenu;
