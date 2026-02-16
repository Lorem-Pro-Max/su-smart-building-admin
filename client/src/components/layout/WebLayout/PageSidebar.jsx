import { Layout, ConfigProvider } from "antd";
import SideBarMenu from "./SidebarItems.jsx";
import { SideBarMenuConfig } from "@styles/themes/sidebarTheme.js";
const { Sider } = Layout;

function SideBar({ collapsed }) {
  return (
    <ConfigProvider theme={SideBarMenuConfig}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={266}
        className="px-3.25 py-6 font-main w-66.5 overflow-y-auto"
        theme="light"
      >
        <SideBarMenu collapsed={collapsed} />
      </Sider>
    </ConfigProvider>
  );
}

export default SideBar;
