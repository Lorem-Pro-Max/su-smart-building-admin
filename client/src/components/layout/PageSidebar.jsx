import { Layout, ConfigProvider } from "antd";
import SideBarMenu from "@components/layout/SidebarItems.jsx";
import { SideBarMenuConfig } from "@styles/SidebarTheme.js";
const { Sider } = Layout;

function SideBar({ collapsed }) {
  return (
    <ConfigProvider theme={SideBarMenuConfig}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={266}
        className="w-sidebar px-3.25 py-6 font-main"
        theme="light"
      >
        <SideBarMenu collapsed={collapsed} />
      </Sider>
    </ConfigProvider>
  );
}

export default SideBar;
