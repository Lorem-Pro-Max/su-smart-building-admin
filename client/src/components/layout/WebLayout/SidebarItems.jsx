import {
  SideBarTitleStyle,
  SideBarChildrenStyle,
} from "@styles/themes/sidebarTheme.js";
import {
  CalendarAntdIcon,
  SignalTowerAntdIcon,
  PeopleAntdIcon,
} from "@components/common/IconConverter";
import { Menu } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import LogoutModal from "../../common/LogoutModal";
import Logout from "../../../assets/images/login/logout.svg"
import { logoutService } from "../../../services/auth";

function SideBarMenu({ collapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeKey =
    location.pathname === "/" ? "/approve-booking" : location.pathname;

  const iconColor = collapsed ? "#141B34" : "#FAAD14";

  const sidebarItems = [
    {
      key: "classroom-book",
      icon: <CalendarAntdIcon style={{ color: iconColor }} />,
      label: <span className={SideBarTitleStyle}>ระบบจองห้องเรียน</span>,
      children: [
        {
          key: "/approve-booking",
          label: <span className={SideBarChildrenStyle}>อนุมัติการจอง</span>,
        },
        {
          key: "/create-booking",
          label: <span className={SideBarChildrenStyle}>สร้างการจอง</span>,
        },
      ],
    },
    {
      key: "smart-building",
      icon: <SignalTowerAntdIcon style={{ color: iconColor }} />,
      label: <span className={SideBarTitleStyle}>ระบบอาคารอัจฉริยะ</span>,
      children: [
        {
          key: "/device-scheduling",
          label: <span className={SideBarChildrenStyle}>ตั้งเวลาเปิด-ปิด</span>,
        },
        {
          key: "/rooms-overview",
          label: <span className={SideBarChildrenStyle}>ห้องภายในอาคาร</span>,
        },
        {
          key: "/classroom-names",
          label: <span className={SideBarChildrenStyle}>ชื่อห้อง</span>,
        },
        {
          key: "/history",
          label: <span className={SideBarChildrenStyle}>ประวัติ</span>,
        },
        {
          key: "/doors",
          label: <span className={SideBarChildrenStyle}>ประตู</span>,
        },
        {
          key: "/exhaust-fans",
          label: <span className={SideBarChildrenStyle}>พัดลมดูดอากาศ</span>,
        },
        {
          key: "/lights",
          label: <span className={SideBarChildrenStyle}>แสงสว่าง</span>,
        },
        {
          key: "/air-conditioners",
          label: <span className={SideBarChildrenStyle}>เครื่องปรับอากาศ</span>,
        },
        {
          key: "/air-quality",
          label: <span className={SideBarChildrenStyle}>คุณภาพอากาศ</span>,
        },
        {
          key: "/valves",
          label: <span className={SideBarChildrenStyle}>น้ำ</span>,
        },
        {
          key: "/electricity",
          label: <span className={SideBarChildrenStyle}>กระแสไฟฟ้า</span>,
        },
      ],
    },
    {
      key: "user-management",
      icon: <PeopleAntdIcon style={{ color: iconColor }} />,
      label: <span className={SideBarTitleStyle}>จัดการผู้ใช้งาน</span>,
      children: [
        {
          key: "/user-permissions",
          label: (
            <span className={SideBarChildrenStyle}>กำหนดสิทธิ์ผู้ใช้งาน</span>
          ),
        },
      ],
    },
  ];

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (err) {
      console.error("Server logout failed, clearing local data anyway:", err);
    } finally {

      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      localStorage.clear();

      navigate("/login");
    }
  };

  const rootSubmenuKeys = sidebarItems.map((item) => item.key);

  return (
    <>
      <div className="flex flex-col h-full">
        <Menu
          theme="light"
          mode="inline"
          items={sidebarItems}
          onClick={(item) => navigate(item.key)}
          selectedKeys={[activeKey]}
          defaultOpenKeys={rootSubmenuKeys}
        />
        <div className="mt-auto w-full pb-4">
          <div
            onClick={() => setIsLogoutModalOpen(true)}
            className={`group flex items-center h-10 rounded-lg cursor-pointer text-primary-dark hover:bg-mint-light hover:text-primary-main transition-colors ${collapsed ? "justify-center w-10" : "gap-2.5 pl-4"}`}
          >
            <img src={Logout} className="w-[18px] h-[18px] shrink-0" alt="logout" />
            {!collapsed && <p className="text-sm font-medium">ออกจากระบบ</p>}
          </div>
        </div>
        <LogoutModal handleLogout={handleLogout} isLogoutModalOpen={isLogoutModalOpen} setIsLogoutModalOpen={setIsLogoutModalOpen} />
      </div>
    </>
  );
}

export default SideBarMenu;
