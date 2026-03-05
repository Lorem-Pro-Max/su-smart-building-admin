import { Table, ConfigProvider } from "antd";
import { HistoryTableTheme } from "@styles/themes/HistoryTableTheme";

const columns = [
  {
    title: "ห้อง/พื้นที่",
    dataIndex: "room",
    key: "room",
    width: "20%",
  },
  {
    title: "ชั้น",
    dataIndex: "floor",
    key: "floor",
    width: "8%",
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
    width: "10%",
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
    width: "10%",
  },
];

function HistoryTable({ data }) {
  const displayData = data.map((item) => {
    return {
      key: item.id,
      room: item.room_title,
      floor: item.room_floor,
      device_name: item.device_type_name,
      device_status: item.action === "on" ? "เปิด" : "ปิด",

      date: new Date(item.action_time).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "2-digit",
      }),

      time: new Date(item.action_time).toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),

      approver_name: item.action_by ? item.full_name : "SYSTEM",
    };
  });

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
        dataSource={displayData}
        pagination={false}
        scroll={{ y: 800 }}
      />
    </ConfigProvider>
  );
}

export default HistoryTable;
