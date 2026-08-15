import { useEffect, useState } from "react";
import { Table, Button, Tag, notification, ConfigProvider } from "antd";
import BookingModal from "./components/BookingModal";
import DeclinedModal from "./components/DeclinedModal";
import DuplicatedModal from "./components/DuplicatedModal";
import FilterModal from "./components/FilterModal";
import { CheckOutlined, CloseOutlined, DownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getBookings, updateBookingStatus, getBookingById, getApproveBookingFilters } from "../../services/booking";
import { LoadingScreen } from "../../components/utils/LoadingScreen";
import ApproveIconTitle from "../../assets/icons/schedule/TitleIcon";
import FilterIcon from "../../assets/icons/approve-booking/FilterIcon";
import "../../styles/variables/approveBooking.css";

export const BookingStatusEnum = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED_BY_ADMIN: "rejectedByAdmin",
  CANCELED_BY_ADMIN: "canceledByAdmin",
  CHECKED_IN: "checked-in",
  COMPLETED: "completed",
  CANCELED_BY_USER: "canceledByUser",
});

const STATUS_FILTER_GROUPS = [
  {
    label: "รออนุมัติ",
    value: "pending",
    statuses: ["pending"],
    color: "#FFE7BA", 
    bdColor: "#FAAD14"
  },
  {
    label: "อนุมัติ",
    value: "approved",
    statuses: ["approved", "checked-in", "completed"],
    color: "#D9F7BE", 
    bdColor: "#52C41A"
  },
  {
    label: "ปฏิเสธ",
    value: "rejected",
    statuses: ["rejectedByAdmin"],
    color: "#FFCCC7", 
    bdColor: "#F5222D"
  },
  {
    label: "ยกเลิก",
    value: "canceled",
    statuses: ["canceledByAdmin", "canceledByUser"],
    color: "#F0F0F0",
    bdColor: "#D9D9D9"
  },
];

function ApproveBookingPage() {
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenDeclinedModal, setIsOpenDeclinedModal] = useState(false);
  const [isOpenDuplicatedModal, setIsOpenDuplicatedModal] = useState(false);
  const [isOpenFilterModal, setIsOpenFilterModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filters, setFilters] = useState({ bookingTypes: null, floors: null, statuses: [], statusGroups: []});
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0});
  const [floorOptions, setFloorOptions] = useState([]);
  const [bookingTypeOptions, setBookingTypeOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);

  const fetchApproveBookingFilters = async () => {
    try {
      const res = await getApproveBookingFilters();

      const floors = (res?.floors || []).map((floor) => ({
        label: `ชั้น ${floor}`,
        value: floor,
      }));

      const bookingTypes = (res?.bookingTypes || []).map((item) => ({
        label: item.name,
        value: item.id,
      }));

      const availableStatuses = new Set((res?.bookingStatuses || []).map((item) => item.status));

      const statuses = STATUS_FILTER_GROUPS.map((group) => ({
          ...group, statuses: group.statuses.filter((status) => availableStatuses.has(status))})).filter((group) => group.statuses.length > 0);

      setFloorOptions(floors);
      setBookingTypeOptions(bookingTypes);
      setStatusOptions(statuses);
    } catch {
      notification.error({ message: "โหลดข้อมูล Filter ไม่สำเร็จ" });
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await getBookings({
        page: pagination.current,
        limit: pagination.pageSize,
        bookingTypes: filters.bookingTypes?.length ? filters.bookingTypes : undefined,
        floors: filters.floors?.length ? filters.floors : undefined,
        status: filters.statuses?.length ? filters.statuses : undefined,
      });

      setTableData(res?.data || []);
      setPagination((prev) => ({ ...prev, total: res?.total || 0 }));
    } catch {
      notification.error({ message: "โหลดข้อมูลไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [pagination.current, pagination.pageSize, filters]);
  
  useEffect(() => {
    fetchApproveBookingFilters();
  }, []);

  const handleConfirmFilter = (values) => {
    setFilters(values);

    setPagination((prev) => ({...prev, current: 1}));

    setIsOpenFilterModal(false);
  };

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
      setActionLoading("approve");

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
      setActionLoading(null);
    }
  };

  const clickGetDeclineBooking = async (bookingId) => {
    try {
      setActionLoading("reject");

      const result = await getBookingById(bookingId);

      setSelectedBooking(result.data);
      setIsOpenDeclinedModal(true);
    } catch {
      notification.error({ message: "เกิดข้อผิดพลาด" });
    } finally {
      setActionLoading(null);
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
    const config = STATUS_FILTER_GROUPS.find(group => group.statuses.includes(record.status));

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
    { title: "เหตุผล", dataIndex: "approvalReason", key: "approvalReason", width: 160, ellipsis: true, render: (reason) => reason || "-" },
  ];

  const rowSelection = {
    selectedRowKeys,

    onChange: (keys) => { setSelectedRowKeys(keys) },

    getCheckboxProps: (record) => ({ name: record.id}),

    columnWidth: 32,
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f3fffe] pb-16">
      {/* Header */}
      <div className="bg-white px-6 pt-5 pb-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left */}
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 m-0 whitespace-nowrap">
              <ApproveIconTitle size={24} />
              อนุมัติการจอง
            </h3>

            <ConfigProvider
                theme={{
                    components: {
                      Button: {
                        defaultHoverBorderColor: "#13C2C2",
                        defaultHoverColor: "#13C2C2",
                        defaultActiveBorderColor: "#13C2C2",
                        defaultActiveColor: "#13C2C2",
                      },
                    },
                }}
              >
              <Button
                icon={<FilterIcon size={18} className="block" />}
                onClick={() => setIsOpenFilterModal(true)}
                className="!h-[40px] !px-4 !font-medium [&_.ant-btn-icon]:!flex [&_.ant-btn-icon]:!items-center [&_.ant-btn-icon]:!justify-center [&_.ant-btn-icon]:!leading-none"
              >
                Filter
              </Button>
            </ConfigProvider>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Button
              icon={<DownloadOutlined />}
              className="!h-[40px] !px-5 !font-medium !border-[#13C2C2] !text-[#262626] !bg-[#E6FFFB]"
            >
              Download Report
            </Button>

            <Button
              type="primary"
              icon={<CheckOutlined />}
              loading={actionLoading === "approve"}
              onClick={handleApproveSelected}
              className="!h-[40px] !px-5 !font-medium !bg-[#13C2C2] disabled:!bg-[#D9D9D9]"
            >
              อนุมัติการจอง
            </Button>

            <Button
              danger
              type="primary"
              icon={<CloseOutlined />}
              loading={actionLoading === "reject"}
              onClick={handleRejectSelected}
              className="!h-[40px] !px-5 !font-medium"
            >
              ปฏิเสธการจอง
            </Button>

            <Button
              type="primary"
              icon={<DeleteOutlined />}
              className="!h-[40px] !px-5 !font-medium !bg-[#595959] !border-[#595959]"
            >
              ลบการจอง
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-[16px] bg-white shadow-sm mt-4">
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: "#13C2C2",
            },
          }}
        >
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={tableData}
            // loading={loading}
            rowKey="id"
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: false,
              onChange: (page) => {
                setPagination((prev) => ({ ...prev, current: page}));
                setSelectedRowKeys([]);
              },
            }}
            scroll={{ x: 1200 }}
            className="booking-approve-table [&_.ant-table-selection-column]:!pl-[16px] [&_.ant-table-selection-column]:!pr-[4px]"
          />
        </ConfigProvider>
      </div>

      {isOpenFilterModal && (
        <FilterModal
          open={isOpenFilterModal}
          floorOptions={floorOptions}
          bookingTypeOptions={bookingTypeOptions}
          statusOptions={statusOptions}
          initialFilters={filters}
          onCancel={() => setIsOpenFilterModal(false)}
          onConfirm={handleConfirmFilter}
        />
      )}

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

       {loading && <LoadingScreen />}
    </div>
  );
}

export default ApproveBookingPage;