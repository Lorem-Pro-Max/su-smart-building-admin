import { useEffect, useState } from "react";
import { Table, Button, Tag, notification, ConfigProvider } from "antd";
import BookingModal from "./components/BookingModal";
import DeclinedModal from "./components/DeclinedModal";
import DuplicatedModal from "./components/DuplicatedModal";
import FilterModal from "./components/FilterModal";
import DeletedModal from "./components/DeletedModal";
import NoSelectionModal from "./components/NoSelectionModal";
import {
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  DeleteOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  getBookings,
  updateBookingStatus,
  getBookingById,
  getApproveBookingFilters,
  deleteBookings,
} from "../../services/booking";
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
    bdColor: "#FAAD14",
  },
  {
    label: "อนุมัติ",
    value: "approved",
    statuses: ["approved", "checked-in", "completed"],
    color: "#D9F7BE",
    bdColor: "#52C41A",
  },
  {
    label: "ปฏิเสธ",
    value: "rejected",
    statuses: ["rejectedByAdmin"],
    color: "#FFCCC7",
    bdColor: "#F5222D",
  },
  {
    label: "ยกเลิก",
    value: "canceled",
    statuses: ["canceledByAdmin", "canceledByUser"],
    color: "#F0F0F0",
    bdColor: "#D9D9D9",
  },
];

const isBookingOverlap = (bookingA, bookingB) => {
  if (!bookingA || !bookingB) return false;

  if (Number(bookingA.roomId) !== Number(bookingB.roomId)) {
    return false;
  }

  const aStart = dayjs(bookingA.startTime).valueOf();
  const aEnd = dayjs(bookingA.endTime).valueOf();
  const bStart = dayjs(bookingB.startTime).valueOf();
  const bEnd = dayjs(bookingB.endTime).valueOf();

  return aStart < bEnd && aEnd > bStart;
};

const buildDuplicateGroups = (bookingResults) => {
  const selectedBookings = bookingResults
    .map((item) => item.booking)
    .filter(Boolean);

  const bookingMap = new Map();
  const adjacency = new Map();

  const addBooking = (booking) => {
    if (!booking?.id) return;

    bookingMap.set(booking.id, booking);

    if (!adjacency.has(booking.id)) {
      adjacency.set(booking.id, new Set());
    }
  };

  const connect = (idA, idB) => {
    if (!idA || !idB || idA === idB) return;

    if (!adjacency.has(idA)) {
      adjacency.set(idA, new Set());
    }

    if (!adjacency.has(idB)) {
      adjacency.set(idB, new Set());
    }

    adjacency.get(idA).add(idB);
    adjacency.get(idB).add(idA);
  };

  selectedBookings.forEach(addBooking);

  bookingResults.forEach((result) => {
    const mainBooking = result.booking;
    const conflicts = Array.isArray(result.conflicts)
      ? result.conflicts
      : result.conflicts
        ? [result.conflicts]
        : [];

    addBooking(mainBooking);

    conflicts.forEach((conflict) => {
      addBooking(conflict);
      connect(mainBooking?.id, conflict.id);
    });
  });

  for (let i = 0; i < selectedBookings.length; i += 1) {
    for (let j = i + 1; j < selectedBookings.length; j += 1) {
      const bookingA = selectedBookings[i];
      const bookingB = selectedBookings[j];

      if (isBookingOverlap(bookingA, bookingB)) {
        connect(bookingA.id, bookingB.id);
      }
    }
  }

  const visited = new Set();
  const duplicateGroups = [];
  const normalBookings = [];

  selectedBookings.forEach((selectedBooking) => {
    if (visited.has(selectedBooking.id)) return;

    const stack = [selectedBooking.id];
    const componentIds = [];

    while (stack.length > 0) {
      const currentId = stack.pop();

      if (visited.has(currentId)) continue;

      visited.add(currentId);
      componentIds.push(currentId);

      const neighbors = adjacency.get(currentId) ?? new Set();

      neighbors.forEach((neighborId) => {
        if (!visited.has(neighborId)) {
          stack.push(neighborId);
        }
      });
    }

    const componentBookings = componentIds
      .map((id) => bookingMap.get(id))
      .filter(Boolean)
      .sort(
        (a, b) => dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf(),
      );

    if (componentBookings.length > 1) {
      duplicateGroups.push({
        duplicate: true,
        booking: selectedBooking,
        conflicts: componentBookings.filter(
          (booking) => booking.id !== selectedBooking.id,
        ),
      });
      return;
    }

    normalBookings.push(selectedBooking);
  });

  return { duplicateGroups, normalBookings };
};

const showSuccessNotification = ({ message, description }) => {
  notification.success({
    message,
    description,
    placement: "topRight",
    duration: 3,
    className: "booking-success-notification",

    style: {
      width: 460,
      minHeight: 72,
      padding: "16px 20px",
      background: "#F6FFED",
      border: "1px solid #B7EB8F",
      borderRadius: 8,
      boxShadow: "none",
    },
  });
};

function ApproveBookingPage() {
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenDeclinedModal, setIsOpenDeclinedModal] = useState(false);
  const [isOpenDuplicatedModal, setIsOpenDuplicatedModal] = useState(false);
  const [isOpenFilterModal, setIsOpenFilterModal] = useState(false);
  const [isOpenDeletedModal, setIsOpenDeletedModal] = useState(false);
  const [isOpenNoSelectionModal, setIsOpenNoSelectionModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [filters, setFilters] = useState({
    bookingTypes: null,
    floors: null,
    statuses: [],
    statusGroups: [],
  });
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [floorOptions, setFloorOptions] = useState([]);
  const [bookingTypeOptions, setBookingTypeOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [declineBookings, setDeclineBookings] = useState([]);
  const [approveBookings, setApproveBookings] = useState([]);
  const [duplicateQueue, setDuplicateQueue] = useState([]);
  const [duplicateIndex, setDuplicateIndex] = useState(0);

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

      const availableStatuses = new Set(
        (res?.bookingStatuses || []).map((item) => item.status),
      );

      const statuses = STATUS_FILTER_GROUPS.map((group) => ({
        ...group,
        statuses: group.statuses.filter((status) =>
          availableStatuses.has(status),
        ),
      })).filter((group) => group.statuses.length > 0);

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
        bookingTypes: filters.bookingTypes?.length
          ? filters.bookingTypes
          : undefined,
        floors: filters.floors?.length ? filters.floors : undefined,
        statuses: filters.statuses?.length ? filters.statuses : undefined,
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

    setPagination((prev) => ({ ...prev, current: 1 }));

    setIsOpenFilterModal(false);
  };

  const getSelectedBookings = () => {
    return tableData.filter((item) => selectedRowKeys.includes(item.id));
  };

  const handleApproveSelected = async () => {
    const bookings = getSelectedBookings();

    if (bookings.length === 0) {
      setIsOpenNoSelectionModal(true);
      return;
    }

    const hasInvalidStatus = bookings.some(
      (booking) => booking.status !== BookingStatusEnum.PENDING,
    );

    if (hasInvalidStatus) {
      notification.warning({
        message: "สามารถอนุมัติได้เฉพาะรายการที่รออนุมัติ",
      });
      return;
    }

    try {
      setActionLoading("approve");

      const results = await Promise.all(
        bookings.map((booking) => getBookingById(booking.id)),
      );

      const bookingResults = results
        .map((result) => result?.data)
        .filter(Boolean);

      const { duplicateGroups, normalBookings } =
        buildDuplicateGroups(bookingResults);

      setApproveBookings(normalBookings);

      if (duplicateGroups.length > 0) {
        setDuplicateQueue(duplicateGroups);
        setDuplicateIndex(0);

        setSelectedBooking(duplicateGroups[0]);
        setIsOpenDuplicatedModal(true);

        return;
      }

      if (normalBookings.length > 0) {
        setIsOpenConfirmModal(true);
      }
    } catch (error) {
      console.error("[Approve] load booking details error:", error);

      notification.error({
        message: "ไม่สามารถโหลดรายละเอียดการจองได้",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSelected = async () => {
    const bookings = getSelectedBookings();

    if (bookings.length === 0) {
      setIsOpenNoSelectionModal(true);
      return;
    }

    const hasInvalidStatus = bookings.some(
      (booking) => booking.status !== BookingStatusEnum.PENDING,
    );

    if (hasInvalidStatus) {
      notification.warning({
        message: "สามารถปฏิเสธได้เฉพาะรายการที่รออนุมัติ",
      });
      return;
    }

    try {
      setActionLoading("reject");

      const results = await Promise.all(
        bookings.map((booking) => getBookingById(booking.id)),
      );

      const bookingDetails = results
        .map((result) => result.data?.booking)
        .filter(Boolean);

      setDeclineBookings(bookingDetails);
      setIsOpenDeclinedModal(true);
    } catch {
      notification.error({ message: "ไม่สามารถโหลดรายละเอียดการจองได้" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRowKeys.length === 0) {
      setIsOpenNoSelectionModal(true);
      return;
    }

    setIsOpenDeletedModal(true);
  };

  const handleConfirmApprove = async (items) => {
    try {
      setActionLoading("approve");

      await Promise.all(
        items.map((item) =>
          updateBookingStatus(
            item.id,
            BookingStatusEnum.APPROVED,
            item.note || "",
          ),
        ),
      );

      await fetchBookings();

      setSelectedRowKeys([]);
      setApproveBookings([]);
      setIsOpenConfirmModal(false);

      showSuccessNotification({
        message: "อนุมัติการจองเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("[Approve] approve bookings error:", error);

      notification.error({
        message: "อนุมัติการจองไม่สำเร็จ",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmReject = async (items) => {
    try {
      setActionLoading("reject");

      await Promise.all(
        items.map((item) =>
          updateBookingStatus(
            item.id,
            BookingStatusEnum.REJECTED_BY_ADMIN,
            item.rejectReason,
          ),
        ),
      );

      await fetchBookings();

      setSelectedRowKeys([]);
      setDeclineBookings([]);
      setIsOpenDeclinedModal(false);

      showSuccessNotification({
        message: "ไม่อนุมัติการจองสำเร็จ",
        description: "ระบบได้ส่งการแจ้งเตือนและเหตุผลไปยังผู้จองเรียบร้อยแล้ว",
      });
    } catch {
      notification.error({ message: "ปฏิเสธการจองไม่สำเร็จ" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDuplicate = async ({
    approveBooking,
    cancelBookings,
    note,
  }) => {
    try {
      setActionLoading("approve");

      const cancelIds = cancelBookings.map((item) => item.id);

      await updateBookingStatus(
        approveBooking.id,
        BookingStatusEnum.APPROVED,
        note || "",
        cancelIds,
      );

      const nextIndex = duplicateIndex + 1;

      if (nextIndex < duplicateQueue.length) {
        setDuplicateIndex(nextIndex);
        setSelectedBooking(duplicateQueue[nextIndex]);

        return;
      }

      setIsOpenDuplicatedModal(false);
      setDuplicateQueue([]);
      setDuplicateIndex(0);
      setSelectedBooking(null);

      if (approveBookings.length > 0) {
        setIsOpenConfirmModal(true);
        return;
      }

      await fetchBookings();

      setSelectedRowKeys([]);

      showSuccessNotification({
        message: "อนุมัติการจองเรียบร้อยแล้ว",
        description:
          "ระบบได้ส่งข้อความแจ้งเตือนและเหตุผลไปยังผู้จองเรียบร้อยแล้ว",
      });
    } catch (error) {
      console.error("[Approve] Duplicate error:", error);

      notification.error({
        message: "อนุมัติรายการจองซ้ำซ้อนไม่สำเร็จ",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (selectedRowKeys.length === 0) return;

    const count = selectedRowKeys.length;

    try {
      setActionLoading("delete");

      await deleteBookings(selectedRowKeys);

      setSelectedRowKeys([]);
      setIsOpenDeletedModal(false);

      showSuccessNotification({
        message: "ลบการจองสำเร็จ",
      });

      if (tableData.length === count && pagination.current > 1) {
        setPagination((prev) => ({
          ...prev,
          current: prev.current - 1,
        }));
      } else {
        await fetchBookings();
      }
    } catch (error) {
      console.error("[Booking] delete error:", error);

      notification.error({
        message: "ลบการจองไม่สำเร็จ",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const renderStatus = (_, record) => {
    const config = STATUS_FILTER_GROUPS.find((group) =>
      group.statuses.includes(record.status),
    );

    if (!config) return "-";

    const actionDate = record.actionDate;

    return (
      <div className="flex items-center gap-2 w-full">
        <Tag
          className="!w-[70px] !min-w-[70px] !text-center !m-0 shrink-0"
          color={config.bdColor}
          variant="outlined"
        >
          <p className="text-[#000000A6]">{config.label}</p>
        </Tag>

        {record.status !== BookingStatusEnum.PENDING && record.actionBy && (
          <div className="min-w-0 flex-1 text-[11px] leading-[16px] text-[#595959]">
            <div className="truncate">{record.actionBy}</div>

            <div className="whitespace-nowrap">
              {actionDate ? dayjs(actionDate).format("DD/MM/YY") : "-"}
            </div>
          </div>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: "วันที่ทำรายการ",
      key: "createdAt",
      width: 120,
      render: (_, record) => dayjs(record.createdAt).format("DD/MM/YY"),
    },
    {
      title: "ชื่อการเรียน/ประชุม",
      dataIndex: "meetingName",
      key: "meetingName",
      width: 170,
      ellipsis: true,
    },
    {
      title: "วันที่จอง",
      key: "bookingDate",
      width: 100,
      render: (_, record) => (
        <span className="font-medium">
          {dayjs(record.startTime).format("DD/MM/YY")}
        </span>
      ),
    },
    {
      title: "เวลา",
      key: "time",
      width: 125,
      render: (_, record) => (
        <span className="font-medium text-[#08979C] whitespace-nowrap">
          {dayjs(record.startTime).format("HH:mm")}
          {" - "}
          {dayjs(record.endTime).format("HH:mm")} น.
        </span>
      ),
    },
    {
      title: "ชั้น",
      dataIndex: "floor",
      key: "floor",
      width: 60,
      render: (floor) => (
        <span className="whitespace-nowrap">ชั้น {floor}</span>
      ),
    },
    {
      title: "ห้อง",
      dataIndex: "title",
      key: "title",
      width: 170,
      ellipsis: true,
    },
    { title: "สถานะ", key: "status", width: 170, render: renderStatus },
    {
      title: "ชื่อผู้จอง",
      dataIndex: "bookingBy",
      key: "bookingBy",
      width: 130,
      render: (value) => <div className="max-w-[120px]">{value || "-"}</div>,
    },
    {
      title: "ประเภทการจอง",
      dataIndex: "bookingType",
      key: "bookingType",
      width: 200,
    },
    {
      title: "เหตุผล",
      dataIndex: "approvalReason",
      key: "approvalReason",
      width: 160,
      ellipsis: true,
      render: (reason) => reason || "-",
    },
  ];

  const rowSelection = {
    selectedRowKeys,

    onChange: (keys) => {
      setSelectedRowKeys(keys);
    },

    getCheckboxProps: (record) => ({ name: record.id }),

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
              loading={actionLoading === "delete"}
              onClick={handleDeleteSelected}
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
                setPagination((prev) => ({ ...prev, current: page }));
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
        key={`${duplicateIndex}-${selectedBooking?.booking?.id ?? "none"}`}
        open={isOpenDuplicatedModal}
        selectedBooking={selectedBooking}
        onCancel={() => {
          setIsOpenDuplicatedModal(false);

          setDuplicateQueue([]);
          setDuplicateIndex(0);

          setApproveBookings([]);
          setSelectedBooking(null);
        }}
        onConfirm={handleConfirmDuplicate}
      />

      <BookingModal
        open={isOpenConfirmModal}
        bookings={approveBookings}
        onCancel={() => {
          setIsOpenConfirmModal(false);
          setApproveBookings([]);
        }}
        onConfirm={handleConfirmApprove}
      />

      <DeclinedModal
        open={isOpenDeclinedModal}
        bookings={declineBookings}
        onCancel={() => {
          setIsOpenDeclinedModal(false);
          setDeclineBookings([]);
        }}
        onConfirm={handleConfirmReject}
      />

      <NoSelectionModal
        open={isOpenNoSelectionModal}
        onCancel={() => setIsOpenNoSelectionModal(false)}
      />

      <DeletedModal
        open={isOpenDeletedModal}
        count={selectedRowKeys.length}
        loading={actionLoading === "delete"}
        onCancel={() => setIsOpenDeletedModal(false)}
        onConfirm={handleConfirmDelete}
      />

      {loading && <LoadingScreen />}
    </div>
  );
}

export default ApproveBookingPage;
