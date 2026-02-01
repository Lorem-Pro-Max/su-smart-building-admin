import { useState } from "react";
import { Divider, Table } from "antd";
import { Button, Tag, Flex, notification } from "antd";
import BookingModal from "./components/BookingModal";
import DeclinedModal from "./components/DeclinedModal";
import DuplicatedModal from "./components/DuplicatedModal";

import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { CheckCircleFilled } from "@ant-design/icons";

const data = [
  {
    key: "1",
    date: "18/12/25",
    title: "สสารรอบตัว",
    bookDate: "27/12/25",
    time: "09:00 - 12:00 น.",
    floor: "ชั้น 3",
    room: "Conference A",
    bookingStatus: "WAITING",
    bookName: "John Brown",
    status: "Approved",
  },
  {
    key: "2",
    date: "18/12/25",
    title: "ระบบนิเวศจำลอง 1",
    bookDate: "27/12/25",
    time: "10:00 - 12:00 น.",
    floor: "ชั้น 4",
    room: "Conference A1",
    bookingStatus: "Approved",
    bookName: "John Brown",
    status: "Nutthawara K. 26/12/25",
  },
  {
    key: "3",
    date: "18/12/25",
    title: "ระบบนิเวศจำลอง 1",
    bookDate: "27/12/25",
    time: "10:00 - 12:00 น.",
    floor: "ชั้น 4",
    room: "Conference A1",
    bookingStatus: "DUPLICATED",
    bookName: "John Brown",
    status: "Nutthawara K. 26/12/25",
  },
];

const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log(
      `selectedRowKeys: ${selectedRowKeys}`,
      "selectedRows: ",
      selectedRows,
    );
  },
  getCheckboxProps: (record) => ({
    disabled: record.name === "Disabled User",
    name: record.name,
  }),
};
function ApproveBookingPage() {
  const [selectionType] = useState("checkbox");
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenDeclinedModal, setIsOpenDeclinedModal] = useState(false);
  const [isOpenDuplicatedModal, setIsOpenDuplicatedModal] = useState(false);

  const handleConfirmDecline = () => {
    notification.success({
      message: "ไม่อนุมัติการจองสำเร็จ",
      description: "ระบบได้ส่งการแจ้งเตือนและเหตุผลไปยังผู้จองเรียบร้อยแล้ว",
      placement: "topRight",
      icon: <CheckCircleFilled style={{ color: "#52C41A", fontSize: 20 }} />,
      className: "!border !border-[#B7EB8F] !bg-[#F6FFED]",
    });

    setIsOpenDeclinedModal(false);
  };

  const handleConfirmApprove = () => {
    notification.open({
      message: "อนุมัติการจองเรียบร้อยแล้ว",
      placement: "topRight",
      type: "success",
      icon: <CheckCircleFilled style={{ color: "#52C41A", fontSize: 20 }} />,
      className: "!border !border-[#B7EB8F] !bg-[#F6FFED]",
    });

    setIsOpenConfirmModal(false);
  };

  const handleConfirmDuplicated = () => {
    notification.success({
      message: "อนุมัติการจองเรียบร้อยแล้ว",
      description: "ระบบได้ส่งข้อความแจ้งยกเลิกไปยังรายการที่จองซ้ำซ้อนแล้ว",
      placement: "topRight",
      icon: <CheckCircleFilled style={{ color: "#52C41A", fontSize: 20 }} />,
      className: "!border !border-[#B7EB8F] !bg-[#F6FFED]",
    });

    setIsOpenDuplicatedModal(false);
  };

  const columns = [
    {
      title: "วันที่ทำรายการ",
      dataIndex: "date",
    },
    {
      title: "ชื่อการเรียน/ประชุม",
      dataIndex: "title",
    },
    {
      title: "วันที่จอง",
      dataIndex: "bookDate",
      render: (text) => {
        return <span className="font-medium">{text}</span>;
      },
    },
    {
      title: "เวลา",
      dataIndex: "time",
      render: (text) => {
        return <span className="font-medium text-[#08979C]">{text}</span>;
      },
    },
    {
      title: "ชั้น",
      dataIndex: "floor",
    },
    {
      title: "ห้อง",
      dataIndex: "room",
    },
    {
      title: "สถานะ",
      dataIndex: "bookingStatus",
      render: (status) => {
        if (status === "Approved") {
          return (
            <Tag
              color="#52C41A"
              variant="outlined"
              className="w-18.5 h-7 flex items-center justify-center leading-none p-0"
            >
              <span className="flex items-center justify-center w-full h-full font-normal text-[14px] text-[#000000A6]">
                อนุมัติ
              </span>
            </Tag>
          );
        }

        if (status === "WAITING" || status === "DUPLICATED") {
          return (
            <Tag
              color="#FAAD14"
              variant="outlined"
              className="w-18.5 h-7 flex items-center justify-center leading-none p-0"
            >
              <span className="flex items-center justify-center w-full h-full font-normal text-[14px] text-[#000000A6]">
                รออนุมัติ
              </span>
            </Tag>
          );
        }
      },
    },
    {
      title: "ชื่อผู้จอง",
      dataIndex: "bookName",
    },
    {
      title: "สถานะ",
      dataIndex: "status",
      render: (text, status) => {
        if (
          status.bookingStatus === "WAITING" ||
          status.bookingStatus === "DUPLICATED"
        ) {
          return (
            <Flex gap="small">
              <Button
                type="primary"
                style={{ backgroundColor: "#13C2C2" }}
                icon={<CheckOutlined />}
                onClick={() => {
                  if (status.bookingStatus === "WAITING") {
                    setIsOpenConfirmModal(true);
                  } else {
                    setIsOpenDuplicatedModal(true);
                  }
                }}
              >
                อนุมัติ
              </Button>
              <Button
                type="primary"
                danger
                icon={<CloseOutlined />}
                onClick={() => setIsOpenDeclinedModal(true)}
              >
                ปฏิเสธ
              </Button>
            </Flex>
          );
        }

        return <span>{text}</span>;
      },
    },
  ];

  return (
    <>
      <DuplicatedModal
        open={isOpenDuplicatedModal}
        onCancel={() => setIsOpenDuplicatedModal(false)}
        onConfirm={handleConfirmDuplicated}
      />
      <BookingModal
        open={isOpenConfirmModal}
        onCancel={() => setIsOpenConfirmModal(false)}
        onConfirm={handleConfirmApprove}
      />
      <DeclinedModal
        open={isOpenDeclinedModal}
        onCancel={() => setIsOpenDeclinedModal(false)}
        onConfirm={handleConfirmDecline}
      />
      <div>
        <Divider />
        <Table
          rowSelection={{ type: selectionType, ...rowSelection }}
          columns={columns}
          dataSource={data}
        />
      </div>
    </>
  );
}

export default ApproveBookingPage;
