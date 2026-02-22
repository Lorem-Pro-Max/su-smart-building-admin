import { useEffect, useState } from "react";
import { Table, Button, Tag, Flex, notification } from "antd";
import BookingModal from "./components/BookingModal";
import DeclinedModal from "./components/DeclinedModal";
import DuplicatedModal from "./components/DuplicatedModal";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getBookings,
  updateBookingStatus,
  getBookingById,
} from "../../services/booking";
import { LoadingScreen } from "../../components/utils/LoadingScreen";

export const BookingStatusEnum = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED_BY_ADMIN: "rejectedByAdmin",
  CANCELED_BY_ADMIN: "canceledByAdmin",
  CHECKED_IN: "checked-in",
  COMPLETED: "completed",
  CANCELED_BY_USER: "canceledByUser",
});

const STATUS_MAP = {
  approved: { label: "อนุมัติ", color: "#52C41A" },
  completed: { label: "อนุมัติ", color: "#52C41A" },
  pending: { label: "รออนุมัติ", color: "#FAAD14" },
  canceledByAdmin: { label: "ยกเลิก", color: "#F0F0F0" },
  rejectedByAdmin: { label: "ปฏิเสธ", color: "red" },
  canceledByUser: { label: "ยกเลิก", color: "#F0F0F0" },
  "checked-in": { label: "อนุมัติ", color: "#52C41A" },
};

function ApproveBookingPage() {
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenDeclinedModal, setIsOpenDeclinedModal] = useState(false);
  const [isOpenDuplicatedModal, setIsOpenDuplicatedModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getBookings({ page: 1, limit: 10 });
      setTableData(res?.data || []);
    } catch (err) {
      console.error(err);
      notification.error({ message: "โหลดข้อมูลไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (
    bookingId,
    status,
    reason = "",
    cancelId = null,
  ) => {
    if (!bookingId) return;

    try {
      setLoading(true);
      await updateBookingStatus(bookingId, status, reason, cancelId);

      setTableData((prev) =>
        prev.map((item) =>
          item.id === bookingId ? { ...item, status } : item,
        ),
      );

      notification.success({
        message:
          status === "rejectedByAdmin"
            ? "ไม่อนุมัติการจองสำเร็จ"
            : "อนุมัติการจองเรียบร้อยแล้ว",
        description: cancelId
          ? "ระบบได้ส่งข้อความแจ้งยกเลิกไปยังรายการที่จองซ้ำซ้อนแล้ว"
          : "ระบบได้ส่งการแจ้งเตือนและเหตุผลไปยังผู้จองเรียบร้อยแล้ว",
      });
    } catch {
      notification.error({ message: "อัปเดตสถานะไม่สำเร็จ" });
    } finally {
      setLoading(false);
      setIsOpenConfirmModal(false);
      setIsOpenDeclinedModal(false);
      setSelectedBooking(null);
      setIsOpenDuplicatedModal(false);
    }
  };

  const clickGetConfirmBooking = async (bookingId) => {
    try {
      const result = await getBookingById(bookingId);

      console.log({ result });

      setSelectedBooking(result.data);
      if (result.data.duplicate) {
        setIsOpenDuplicatedModal(true);
      } else {
        setIsOpenConfirmModal(true);
      }
    } catch {
      notification.error({ message: "เกิดข้อผิดพลาด" });
    }
  };

  const clickGetDeclineBooking = async (bookingId) => {
    try {
      const result = await getBookingById(bookingId);
      setSelectedBooking(result.data);
      setIsOpenDeclinedModal(true);
    } catch {
      notification.error({ message: "เกิดข้อผิดพลาด" });
    }
  };
  const renderStatusTag = (status) => {
    const config = STATUS_MAP[status];
    if (!config) return null;

    return (
      <Tag
        className="!w-[70px] !text-center !m-0"
        color={config.color}
        variant="outlined"
      >
        <p className="text-[#000000A6]">{config.label}</p>
      </Tag>
    );
  };

  const columns = [
    {
      title: "วันที่ทำรายการ",
      render: (_, record) => dayjs(record.createdAt).format("DD/MM/YY"),
    },
    { title: "ชื่อการเรียน/ประชุม", dataIndex: "meetingName" },
    {
      title: "วันที่จอง",
      render: (_, record) => (
        <span className="font-medium">
          {dayjs(record.startTime).format("DD/MM/YY")}
        </span>
      ),
    },
    {
      title: "เวลา",
      render: (_, record) => (
        <span className="font-medium text-[#08979C]">
          {dayjs(record.startTime).format("HH:mm")} -{" "}
          {dayjs(record.endTime).format("HH:mm")} น.
        </span>
      ),
    },
    { title: "ชั้น", dataIndex: "floor" },
    { title: "ห้อง", dataIndex: "title" },
    { title: "สถานะ", dataIndex: "status", render: renderStatusTag },
    { title: "ชื่อผู้จอง", dataIndex: "bookingBy" },
    {
      title: "การดำเนินการ",
      render: (_, record) => {
        console.log({ record });

        if (record.status !== "pending") {
          const formattedDate = record.bookingDate
            ? new Date(record.bookingDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })
            : "-";

          return (
            <div>
              <p className="text-[14px]">{record.actionBy ?? "-"}</p>
              <p className="text-[14px]">{formattedDate}</p>
            </div>
          );
        }

        return (
          <Flex gap="small">
            <Button
              type="primary"
              loading={loading}
              disabled={loading}
              style={{ backgroundColor: "#13C2C2" }}
              icon={<CheckOutlined />}
              onClick={() => {
                clickGetConfirmBooking(record.id);
              }}
            >
              อนุมัติ
            </Button>

            <Button
              danger
              loading={loading}
              disabled={loading}
              icon={<CloseOutlined />}
              onClick={() => {
                clickGetDeclineBooking(record.id);
              }}
            >
              ปฏิเสธ
            </Button>
          </Flex>
        );
      },
    },
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <h3 className="text-lg font-semibold flex items-center gap-2 ml-4 mt-4 mb-8">
        <img
          src="src/assets/icons/approve-booking/approve-title.svg"
          alt="approve"
          className="w-[20px] h-[20px]"
        />
        อนุมัติการจอง
      </h3>

      <DuplicatedModal
        open={isOpenDuplicatedModal}
        onCancel={() => setIsOpenDuplicatedModal(false)}
        selectedBooking={selectedBooking}
        onConfirm={() =>
          handleUpdateStatus(
            selectedBooking?.booking.id,
            "approved",
            "duplicated",
            selectedBooking?.conflicts.id,
          )
        }
      />

      <BookingModal
        open={isOpenConfirmModal}
        onCancel={() => setIsOpenConfirmModal(false)}
        selectedBooking={selectedBooking}
        onConfirm={() =>
          handleUpdateStatus(selectedBooking?.booking.id, "approved")
        }
      />

      <DeclinedModal
        open={isOpenDeclinedModal}
        onCancel={() => setIsOpenDeclinedModal(false)}
        selectedBooking={selectedBooking}
        onConfirm={() =>
          handleUpdateStatus(selectedBooking?.booking.id, "rejectedByAdmin")
        }
      />

      <Table
        columns={columns}
        dataSource={tableData}
        loading={loading}
        rowKey="id"
      />
    </>
  );
}

export default ApproveBookingPage;
