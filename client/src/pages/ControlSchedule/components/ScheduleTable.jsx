import { Table } from "antd";

import { UpOutlined, DownOutlined } from "@ant-design/icons";
import { useState, useMemo } from "react";
import Delete from "../../../assets/icons/action/Delete";

const ScheduleTable = ({
  setListDeleteId,
  setIsOpenDeleteModal,
  tableData,
  loading,
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const onDelete = (record) => {
    const scheduleIds = record.schedules.map((s) => s.id);

    setIsOpenDeleteModal(true);
    setListDeleteId(scheduleIds);
  };
  const handleToggle = (record) => {
    if (record.schedules.length <= 1) return;

    const uniqueId = record.schedules[0].id;
    setExpandedRow((prev) => (prev === uniqueId ? null : uniqueId));
  };

  const columns = useMemo(
    () => [
      {
        title: "ห้อง",
        dataIndex: "meeting_name",
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
          const isExpanded = expandedRow === record.schedules[0].id;

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
          <span>{record.schedules[0].action === "on" ? "เปิด" : "ปิด"}</span>
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
        render: (_, record) => {
          return (
            <div onClick={() => onDelete(record)}>
              <Delete />
            </div>
          );
        },
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
        rowKey={(record) => record.schedules[0].id}
        pagination={false}
        scroll={{ x: "max-content" }}
        className="rounded-xl overflow-hidden shadow-sm"
      />
    </div>
  );
};

export default ScheduleTable;
``;
