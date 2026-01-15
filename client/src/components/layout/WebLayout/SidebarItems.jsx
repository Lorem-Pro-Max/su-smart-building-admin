import {
  SideBarTitleStyle,
  SideBarChildrenStyle,
} from "@styles/themes/sidebarTheme.js";
import {
  CalendarAntdIcon,
  SignalTowerAntdIcon,
} from "@components/common/IconConverter";
import { Menu } from "antd";
import { useNavigate } from "react-router-dom";

const sidebarItems = [
  {
    key: "classroom-book",
    icon: <CalendarAntdIcon />,
    label: <span className={SideBarTitleStyle}>ระบบจองห้องเรียน</span>,
    children: [
      {
        key: "/approve-booking",
        label: <span className={SideBarChildrenStyle}>อนุมัติการจอง</span>,
      },
    ],
  },
  {
    key: "smart-building",
    icon: <SignalTowerAntdIcon />,
    label: <span className={SideBarTitleStyle}>ระบบอาคารอัจฉริยะ</span>,
    children: [
      {
        key: "/scheduling",
        label: <span className={SideBarChildrenStyle}>ตั้งเวลาเปิด-ปิด</span>,
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
        key: "/lighting",
        label: <span className={SideBarChildrenStyle}>แสงสว่าง</span>,
      },
      {
        key: "/temperature",
        label: <span className={SideBarChildrenStyle}>อุณหภูมิ</span>,
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
    icon: <CalendarAntdIcon />,
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

function SideBarMenu() {
  const navigate = useNavigate();
  return (
    <Menu
      theme="light"
      mode="inline"
      items={sidebarItems}
      onClick={(item) => navigate(item.key)}
      defaultSelectedKeys={["/"]}
    />
  );
}

export default SideBarMenu;
