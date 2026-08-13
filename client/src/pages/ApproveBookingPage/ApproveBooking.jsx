import { useEffect, useState } from "react";
import { Table, Button, Tag, notification, Checkbox } from "antd";
import BookingModal from "./components/BookingModal";
import DeclinedModal from "./components/DeclinedModal";
import DuplicatedModal from "./components/DuplicatedModal";
import { CheckOutlined, CloseOutlined, DownloadOutlined, DeleteOutlined, FilterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getBookings, updateBookingStatus, getBookingById } from "../../services/booking";
import { LoadingScreen } from "../../components/utils/LoadingScreen";
import ApproveIconTitle from "../../assets/icons/schedule/TitleIcon";

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
  approved: { label: "อนุมัติ", color: "#D9F7BE", bdColor: "#52C41A" },
  completed: { label: "อนุมัติ", color: "#D9F7BE", bdColor: "#52C41A" },
  pending: { label: "รออนุมัติ", color: "#FFE7BA", bdColor: "#FAAD14" },
  canceledByAdmin: { label: "ยกเลิก", color: "#F0F0F0", bdColor: "#D9D9D9"},
  rejectedByAdmin: { label: "ปฏิเสธ", color: "#FFCCC7", bdColor: "#F5222D" },
  canceledByUser: { label: "ยกเลิก", color: "#F0F0F0", bdColor: "#D9D9D9" },
  "checked-in": { label: "อนุมัติ", color: "#D9F7BE", bdColor: "#52C41A" },
};

function ApproveBookingPage() {
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenDeclinedModal, setIsOpenDeclinedModal] = useState(false);
  const [isOpenDuplicatedModal, setIsOpenDuplicatedModal] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getBookings({ page: 1, limit: 10 });
      setTableData(res?.data || []);
    } catch {
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
      setActionLoading(true);

      await updateBookingStatus(bookingId, status, reason, cancelId);

      await fetchBookings();

      setSelectedRowKeys([]);

      notification.success({
        message:
          status === BookingStatusEnum.REJECTED_BY_ADMIN
            ? "ไม่อนุมัติการจองสำเร็จ"
            : "อนุมัติการจองเรียบร้อยแล้ว",
        description: cancelId
          ? "ระบบได้ส่งข้อความแจ้งยกเลิกไปยังรายการที่จองซ้ำซ้อนแล้ว"
          : "ระบบได้ส่งการแจ้งเตือนและเหตุผลไปยังผู้จองเรียบร้อยแล้ว",
      });
    } catch {
      notification.error({ message: "อัปเดตสถานะไม่สำเร็จ" });  
    } finally {
      setActionLoading(false);
      setIsOpenConfirmModal(false);
      setIsOpenDeclinedModal(false);
      setIsOpenDuplicatedModal(false);
      setSelectedBooking(null);
    }
  };

  const clickGetConfirmBooking = async (bookingId) => {
    try {
      setActionLoading(true);

      const result = await getBookingById(bookingId);

      setSelectedBooking(result.data);

      if (result.data?.duplicate) {
        setIsOpenDuplicatedModal(true);
      } else {
        setIsOpenConfirmModal(true);
      }
    } catch {
      notification.error({ message: "เกิดข้อผิดพลาด" });
    } finally {
      setActionLoading(false);
    }
  };

  const clickGetDeclineBooking = async (bookingId) => {
    try {
      setActionLoading(true);

      const result = await getBookingById(bookingId);

      setSelectedBooking(result.data);
      setIsOpenDeclinedModal(true);
    } catch {
      notification.error({ message: "เกิดข้อผิดพลาด" });
    } finally {
      setActionLoading(false);
    }
  };

  const getSelectedBooking = () => {
    if (selectedRowKeys.length !== 1) return null;

    return tableData.find(
      (item) => item.id === selectedRowKeys[0],
    );
  };

  const handleApproveSelected = () => {
    const booking = getSelectedBooking();

    if (!booking) {
      notification.warning({
        message: "กรุณาเลือก 1 รายการ",
      });
      return;
    }

    if (booking.status !== BookingStatusEnum.PENDING) {
      notification.warning({
        message: "สามารถอนุมัติได้เฉพาะรายการที่รออนุมัติ",
      });
      return;
    }

    clickGetConfirmBooking(booking.id);
  };

  const handleRejectSelected = () => {
    const booking = getSelectedBooking();

    if (!booking) {
      notification.warning({
        message: "กรุณาเลือก 1 รายการ",
      });
      return;
    }

    if (booking.status !== BookingStatusEnum.PENDING) {
      notification.warning({
        message: "สามารถปฏิเสธได้เฉพาะรายการที่รออนุมัติ",
      });
      return;
    }

    clickGetDeclineBooking(booking.id);
  };

  const renderStatus = (_, record) => {
    const config = STATUS_MAP[record.status];

    if (!config) return "-";

    const actionDate =
      record.bookingDate || record.updatedAt;

    return (
      <div className="flex items-center gap-2 w-full">
        <Tag
          className="!w-[70px] !min-w-[70px] !text-center !m-0 shrink-0"
          color={config.bdColor}
          variant="outlined"
        >
          <p className="text-[#000000A6]">{config.label}</p>
        </Tag>

        {record.status !== BookingStatusEnum.PENDING &&
          record.actionBy && (
            <div className="min-w-0 flex-1 text-[11px] leading-[16px] text-[#595959]">
              <div className="truncate">
                {record.actionBy}
              </div>

              <div className="whitespace-nowrap">
                {actionDate
                  ? dayjs(actionDate).format("DD/MM/YY")
                  : "-"}
              </div>
            </div>
          )}
      </div>
    );
  };

  const columns = [
    { title: "วันที่ทำรายการ", key: "createdAt", width: 120, render: (_, record) => dayjs(record.createdAt).format("DD/MM/YY")},
    { title: "ชื่อการเรียน/ประชุม", dataIndex: "meetingName", key: "meetingName", width: 170, ellipsis: true},
    { 
      title: "วันที่จอง", key: "bookingDate", width: 100,
      render: (_, record) => (
        <span className="font-medium">
          {dayjs(record.startTime).format("DD/MM/YY")}
        </span>
      ),
    },
    {
      title: "เวลา", key: "time", width: 125,
      render: (_, record) => (
        <span className="font-medium text-[#08979C] whitespace-nowrap">
          {dayjs(record.startTime).format("HH:mm")}
          {" - "}
          {dayjs(record.endTime).format("HH:mm")} น.
        </span>
      ),
    },
    {
      title: "ชั้น", dataIndex: "floor", key: "floor", width: 60,
      render: (floor) => (
        <span className="whitespace-nowrap">
          ชั้น {floor}
        </span>
      ),
    },
    { title: "ห้อง", dataIndex: "title", key: "title", width: 170, ellipsis: true },
    { title: "สถานะ", key: "status", width: 170, render: renderStatus },
    { 
      title: "ชื่อผู้จอง", dataIndex: "bookingBy", key: "bookingBy", width: 130,
      render: (value) => (
        <div className="max-w-[120px]">
          {value || "-"}
        </div>
      ),
    },
    { title: "ประเภทการจอง", dataIndex: "bookingType", key: "bookingType", width: 200 },
    { title: "เหตุผล", dataIndex: "reason", key: "reason", width: 160, ellipsis: true, render: (reason) => reason || "-" },
  ];

  const isAllSelected =
  tableData.length > 0 &&
  selectedRowKeys.length === tableData.length;

  const rowSelection = {
    selectedRowKeys,

    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },

    getCheckboxProps: (record) => ({
      name: record.id,
    }),

    columnWidth: 32,

    columnTitle: (
      <Checkbox
        checked={isAllSelected}
        indeterminate={false}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedRowKeys(tableData.map((item) => item.id));
          } else {
            setSelectedRowKeys([]);
          }
        }}
      />
    ),
  };

  return (
    <div className="min-h-full bg-[#EAFFFD]">
      {/* Header */}
      <div className="bg-white px-6 pt-5 pb-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 m-0 whitespace-nowrap">
              <ApproveIconTitle size={24} />
              อนุมัติการจอง
            </h3>

            <Button
              icon={<FilterOutlined />}
              className="!h-[40px] !px-4 !font-medium"
            >
              Filter
            </Button>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Button
              icon={<DownloadOutlined />}
              className="
                !h-[40px]
                !px-5
                !font-medium
                !border-[#13C2C2]
                !text-[#262626]
                !bg-[#E6FFFB]
              "
            >
              Download Report
            </Button>

            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={actionLoading}
              onClick={handleApproveSelected}
              className="
                !h-[40px]
                !px-5
                !font-medium
                !bg-[#13C2C2]
                disabled:!bg-[#D9D9D9]
              "
            >
              อนุมัติการจอง
            </Button>

            <Button
              danger
              type="primary"
              icon={<CloseOutlined />}
              loading={actionLoading}
              onClick={handleRejectSelected}
              className="!h-[40px] !px-5 !font-medium"
            >
              ปฏิเสธการจอง
            </Button>

            <Button
              type="primary"
              icon={<DeleteOutlined />}
              className="
                !h-[40px]
                !px-5
                !font-medium
                !bg-[#595959]
                !border-[#595959]
              "
            >
              ลบการจอง
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="pt-4">
        <div className="overflow-hidden rounded-[16px] bg-white shadow-sm">
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={tableData}
            loading={loading}
            rowKey="id"
            pagination={false}
            scroll={{ x: 1200 }}
            className="
              booking-approve-table
              [&_.ant-table-selection-column]:!pl-[16px]
              [&_.ant-table-selection-column]:!pr-[4px]
            "
          />
        </div>
      </div>

      <DuplicatedModal
        open={isOpenDuplicatedModal}
        onCancel={() => {
          setIsOpenDuplicatedModal(false);
          setSelectedBooking(null);
        }}
        selectedBooking={selectedBooking}
        onConfirm={() =>
          handleUpdateStatus(
            selectedBooking?.booking?.id,
            BookingStatusEnum.APPROVED,
            "duplicated",
            selectedBooking?.conflicts?.id,
          )
        }
      />

      <BookingModal
        open={isOpenConfirmModal}
        onCancel={() => {
          setIsOpenConfirmModal(false);
          setSelectedBooking(null);
        }}
        selectedBooking={selectedBooking}
        onConfirm={() =>
          handleUpdateStatus(
            selectedBooking?.booking?.id,
            BookingStatusEnum.APPROVED,
          )
        }
      />

      <DeclinedModal
        open={isOpenDeclinedModal}
        onCancel={() => {
          setIsOpenDeclinedModal(false);
          setSelectedBooking(null);
        }}
        selectedBooking={selectedBooking}
        onConfirm={() =>
          handleUpdateStatus(
            selectedBooking?.booking?.id,
            BookingStatusEnum.REJECTED_BY_ADMIN,
          )
        }
      />
    </div>
  );
}

export default ApproveBookingPage;