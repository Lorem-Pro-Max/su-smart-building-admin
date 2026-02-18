import { Table } from "antd";

import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useState, useMemo } from "react";

const ScheduleTable = ({
  setBookingId,
  setIsOpenDeleteModal,
  tableData,
  loading,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const onDelete = (id) => {
    setIsOpenDeleteModal(true);
    setBookingId(id);
  };

  const handleToggle = (record) => {
    if (record.schedules.length <= 1) return;

    setExpandedRow((prev) =>
      prev === record.booking_id ? null : record.booking_id,
    );
  };

  const columns = useMemo(
    () => [
      {
        title: "ห้อง",
        dataIndex: "room_name",
        width: 200,
        responsive: ["xs", "sm", "md", "lg"],
        render: (text) => (
          <span className="font-medium text-gray-800 break-words">{text}</span>
        ),
      },
      {
        title: "อุปกรณ์",
        width: 220,
        responsive: ["xs", "sm", "md", "lg"],
        render: (_, record) => {
          const isExpanded = expandedRow === record.booking_id;

          const devices = isExpanded
            ? record.schedules
            : record.schedules.slice(0, 1);

          return (
            <div className="flex flex-col gap-1 break-words">
              {record.schedules.length > 1 && (
                <div
                  className="flex items-start gap-2 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(record);
                  }}
                >
                  {!isExpanded ? (
                    <DownOutlined className="text-xs mt-[4px]" />
                  ) : (
                    <UpOutlined className="text-xs mt-[4px]" />
                  )}

                  <span>{devices[0].device.type}</span>
                </div>
              )}

              {isExpanded &&
                record.schedules.slice(1).map((item) => (
                  <div key={item.id} className="pl-5 text-sm text-gray-600">
                    {item.device.type}
                  </div>
                ))}

              {record.schedules.length === 1 && (
                <span>{record.schedules[0].device.type}</span>
              )}
            </div>
          );
        },
      },
      {
        title: "จำนวน",
        dataIndex: "device_count",
        align: "center",
        width: 100,
        responsive: ["sm", "md", "lg"],
      },
      {
        title: "ชั้น",
        dataIndex: ["room", "floor"],
        align: "center",
        width: 100,
        responsive: ["sm", "md", "lg"],
      },
      {
        title: "ประเภท",
        width: 100,
        align: "center",
        responsive: ["md", "lg"],
        render: (_, record) => (
          <span>{record.schedules[0].action === "open" ? "เปิด" : "ปิด"}</span>
        ),
      },
      {
        title: "วันที่",
        dataIndex: "date",
        width: 120,
        responsive: ["md", "lg"],
      },
      {
        title: "เวลา",
        dataIndex: "time",
        width: 100,
        responsive: ["md", "lg"],
        render: (time) => (
          <span className="text-[#0958D9] whitespace-nowrap">{time}</span>
        ),
      },
      {
        title: "ผู้ดำเนินการ",
        dataIndex: "operator",
        width: 150,
        responsive: ["lg"],
      },
      {
        title: "ลบ",
        width: 80,
        render: (_, record) => (
          <img
            src="src/assets/icons/action/delete.svg"
            alt="delete"
            className="w-[22px] h-[22px] cursor-pointer hover:opacity-70 transition"
            onClick={() => onDelete(record.booking_id)}
          />
        ),
      },
    ],
    [expandedRow, onDelete],
  );

  return (
    <div className="w-full overflow-x-auto">
      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        disabl
        rowKey="booking_id"
        pagination={false}
        scroll={{ x: "max-content" }}
        className="rounded-xl overflow-hidden shadow-sm"
      />
    </div>
  );
};

export default ScheduleTable;
``;
