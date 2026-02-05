import { Table, ConfigProvider } from "antd";
import { HistoryTableTheme } from "@styles/themes/HistoryTableTheme";

const columns = [
  {
    title: "ห้อง/พื้นที่",
    dataIndex: "room",
    key: "room",
    width: "30%",
  },
  {
    title: "ชั้น",
    dataIndex: "floor",
    key: "floor",
    width: "5%",
  },
  {
    title: "ชื่ออุปกรณ์",
    dataIndex: "device_name",
    key: "device_name",
    width: "15%",
  },
  {
    title: "สถานะ",
    dataIndex: "device_status",
    key: "device_status",
    width: "5%",
  },
  {
    title: "วันที่",
    dataIndex: "date",
    key: "date",
    width: "12%",
  },
  {
    title: "เวลา",
    dataIndex: "time",
    key: "time",
    width: "8%",
    render: (text) => <span className="text-[#1890FF]">{text}</span>,
  },
  {
    title: "ผู้ดำเนินการ",
    dataIndex: "approver_name",
    key: "approver_name",
  },
];

const mockData = [
  {
    key: "1",
    room: "CO-Working space 1",
    floor: "2",
    device_name: "ประตู",
    device_status: "เปิด",
    date: "3 Jan 26",
    time: "12:00",
    approver_name: "ณัฐวรา กุตริ",
  },
  {
    key: "2",
    room: "CO-Working space 1",
    floor: "2",
    device_name: "ประตู",
    device_status: "ปิด",
    date: "3 Jan 26",
    time: "19:00",
    approver_name: "ดวงจันทร์ จันทร์กระจ่าง",
  },
  {
    key: "3",
    room: "สัมมนา 1",
    floor: "2",
    device_name: "ประตู",
    device_status: "เปิด",
    date: "25 Dec 25",
    time: "10:00",
    approver_name: "ดวงจันทร์ จันทร์กระจ่าง",
  },
  {
    key: "4",
    room: "ห้องประชุมวิจัยและนวัตกรรมชั้นนำแห่งอนาคต (Stress Test)",
    floor: "2",
    device_name: "แสงสว่าง",
    device_status: "เปิด",
    date: "25 Dec 25",
    time: "10:00",
    approver_name: "ดวงจันทร์ จันทร์กระจ่าง",
  },
  {
    key: "5",
    room: "สัมมนา 1",
    floor: "2",
    device_name: "อุณหภูมิ",
    device_status: "เปิด",
    date: "25 Dec 25",
    time: "10:00",
    approver_name: "ดวงจันทร์ จันทร์กระจ่าง",
  },
];

function HistoryTable() {
  return (
    <ConfigProvider theme={HistoryTableTheme}>
      <Table
        columns={columns}
        styles={{
          header: {
            cell: {
              fontWeight: "600",
              fontSize: "14px",
              lineHeight: "22px",
              backgroundColor: "#00000005",
              padding: "8px 16px",
            },
          },
          body: {
            cell: {
              fontSize: "14px",
              fontWeight: "300",
              fontFamily: "var(--font-main)",
              color: "#000000E0",
            },
          },
        }}
        dataSource={mockData}
        pagination={{
          position: ["none"],
        }}
      />
    </ConfigProvider>
  );
}

export default HistoryTable;
