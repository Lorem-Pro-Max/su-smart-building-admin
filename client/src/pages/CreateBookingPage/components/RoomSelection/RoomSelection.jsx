import { Modal, Form } from "antd";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import RoomPickerCard from "./RoomPickerCard";
import RoomsByFloorTabs from "./RoomByFloorTabs";
import RoomFilter from "./RoomFilter";
import useRoomByFloor from "./useRoomByFloor";
import {
  getConflictingApprovedBookings,
  getRoomIdsBookedInRange,
} from "../../utils/bookingAvailability";
import { getBookingsOnDate } from "@services/booking";

const EMPTY_FILTERS = {
  minStudySeats: null,
  minExamSeats: null,
  date: null,
  startTime: null,
  endTime: null,
};

function matchesSeatFilters(roomItem, { minStudySeats, minExamSeats }) {
  if (minStudySeats && !(roomItem.study_seats >= minStudySeats)) return false;
  if (minExamSeats && !(roomItem.exam_seats >= minExamSeats)) return false;
  return true;
}

export default function RoomSelection({
  isModalOpen,
  setIsModalOpen,
  setFormData,
  formData,
  rooms,
  bookings = [],
  selectedDate,
}) {
  const [tempSelectedRoom, setTempSelectedRoom] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [bookingsOnFilterDate, setBookingsOnFilterDate] = useState({ dateStr: "", data: [] });

  const dateStr = selectedDate ? dayjs(selectedDate).format("YYYY-MM-DD") : "";
  const filterDateStr = filters.date ? dayjs(filters.date).format("YYYY-MM-DD") : "";
  const isFilterDateSameAsForm = Boolean(filterDateStr) && filterDateStr === dateStr;

  useEffect(() => {
    if (!filterDateStr || isFilterDateSameAsForm) return;

    let isCurrentRequest = true;

    getBookingsOnDate(filterDateStr)
      .then((data) => {
        if (isCurrentRequest) setBookingsOnFilterDate({ dateStr: filterDateStr, data });
      })
      .catch(() => {
        if (isCurrentRequest) setBookingsOnFilterDate({ dateStr: filterDateStr, data: [] });
      });

    return () => { isCurrentRequest = false; };
  }, [filterDateStr, isFilterDateSameAsForm]);

  const bookingsForFilter = isFilterDateSameAsForm
    ? bookings
    : bookingsOnFilterDate.dateStr === filterDateStr
      ? bookingsOnFilterDate.data
      : null;

  const filteredRooms = useMemo(() => {
    const { startTime, endTime } = filters;
    const shouldFilterByTime = Boolean(filterDateStr && startTime && endTime && bookingsForFilter);

    return (rooms ?? []).filter((roomItem) => {
      if (!matchesSeatFilters(roomItem, filters)) return false;

      if (shouldFilterByTime) {
        const conflicts = getConflictingApprovedBookings(
          bookingsForFilter,
          filterDateStr,
          roomItem.id,
          startTime,
          endTime
        );
        if (conflicts.length > 0) return false;
      }

      return true;
    });
  }, [rooms, filters, filterDateStr, bookingsForFilter]);

  const roomsGroupedByFloor = useRoomByFloor(filteredRooms);

  const activeFilterCount =
    (filters.minStudySeats ? 1 : 0) +
    (filters.minExamSeats ? 1 : 0) +
    (filters.startTime && filters.endTime ? 1 : 0);

  const disabledRoomIds = useMemo(() => {
    if (!dateStr || !formData.startTime || !formData.endTime) return new Set();
    return getRoomIdsBookedInRange(
      bookings,
      dateStr,
      formData.startTime,
      formData.endTime
    );
  }, [bookings, dateStr, formData.startTime, formData.endTime]);

  const selectedRoom = filteredRooms.some(
    (roomItem) => Number(roomItem.id) === Number(tempSelectedRoom?.id)
  )
    ? tempSelectedRoom
    : null;

  const isSelectedRoomDisabled = selectedRoom && disabledRoomIds.has(Number(selectedRoom.id));
  const canConfirmRoom = Boolean(selectedRoom) && !isSelectedRoomDisabled;

  useEffect(() => {
    if (isModalOpen) { setTempSelectedRoom(formData.room ?? null); }
  }, [isModalOpen, formData.room]);

  return (
    <Form.Item label={<span className="font-medium">ห้องที่ต้องการจอง</span>} required>
      <RoomPickerCard
        rooms={rooms}
        formData={formData}
        setFormData={setFormData}
        onOpenModal={() => setIsModalOpen(true)} />

      <Modal
        title={<span className="text-xl font-bold font-main">เลือกห้องเรียน/ห้องประชุม</span>}
        open={isModalOpen}
        centered
        width={1143}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
      >
        <RoomsByFloorTabs
          roomsGroupedByFloor={roomsGroupedByFloor}
          tempSelectedRoom={selectedRoom}
          onSelectTempRoom={setTempSelectedRoom}
          disabledRoomIds={disabledRoomIds}
          hasActiveFilters={activeFilterCount > 0}
          filterSlot={
            <RoomFilter
              filters={filters}
              onChangeFilters={setFilters}
              activeFilterCount={activeFilterCount}
              formDate={selectedDate}
              isOpen={isFilterOpen}
              setIsOpen={setIsFilterOpen}
            />
          }
        />
        <div className="w-full flex flex-col sm:flex-row gap-2 pt-5">
          <button
            className="w-full sm:w-1/2 rounded-lg h-10 border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          >
            ยกเลิก
          </button>
          <button
            disabled={!canConfirmRoom}
            className={`w-full sm:w-1/2 rounded-lg h-10 transition ${canConfirmRoom ? "bg-mint-dark hover:bg-mint-darker text-white! cursor-pointer" : "bg-gray-300 cursor-not-allowed text-white"}`}
            onClick={() => {
              if (canConfirmRoom) {
                setIsModalOpen(false);
                setFormData((prev) => ({ ...prev, room: selectedRoom }));
              }
            }}
          >
            ยืนยัน
          </button>
        </div>

      </Modal>
    </Form.Item>
  );
}
