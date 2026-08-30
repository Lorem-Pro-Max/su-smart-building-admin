import { BookingCalendar, BookingForm } from "./components";
import dayjs from "dayjs";
import { useCallback, useState, useEffect } from "react";
import { ConfigProvider, message } from "antd";

import { getBookingsOnDate } from "@services/booking";
import { getBookableRooms } from "@services/classroomRooms";
import { LoadingScreen } from "@components/utils/LoadingScreen";
import BookingIcon from "@assets/images/create-booking/booking.svg";


const bookingTheme = {
  token: {
    colorPrimary: "#13c2c2",
  },
};

export default function CreateBookingPage() {
  const [date, setDate] = useState(() => dayjs());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState([]);


  const reloadBookings = useCallback(async () => {
    if (!date) return;

    setLoading(true);
    try {
      const data = await getBookingsOnDate(date.format("YYYY-MM-DD"));
      setBookings(data);
    } catch (err) {
      message.error(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    reloadBookings();
  }, [reloadBookings]);

  useEffect(() => {
    getBookableRooms()
      .then(setRooms)
      .catch((err) => {
        message.error(err.message);
        setRooms([]);
      });
  }, []);

  return (
    <ConfigProvider theme={bookingTheme}>
      <div className="h-full flex flex-col overflow-hidden bg-[#f3fffe]">
        <div className="bg-white px-6 pt-5 pb-4 shrink-0">
          <h3 className="text-lg font-semibold flex items-center gap-2 m-0">
            <img src={BookingIcon} className="w-6 h-6" alt="" />
            สร้างการจอง
          </h3>
          <p className="text-[#737373] text-sm m-0">
            การจองที่สร้างจากหน้านี้จะได้รับการอนุมัติทันที
          </p>
        </div>

        <div className="flex-1 min-h-0 flex flex-col xl:flex-row gap-4 mt-4 pr-6 overflow-y-auto xl:overflow-hidden">
          <div className="flex-1 min-w-0 rounded-[16px] bg-white shadow-sm p-2 xl:overflow-y-auto">
            <BookingCalendar
              date={date}
              setDate={setDate}
              bookings={bookings}
              loading={loading}
            />
          </div>
          <div className="w-full xl:w-100 2xl:w-110 shrink-0 rounded-[16px] bg-white shadow-sm xl:overflow-y-auto">
            <BookingForm
              date={date}
              setDate={setDate}
              bookings={bookings}
              rooms={rooms}
              loading={loading}
              setLoading={setLoading}
              onCreated={reloadBookings}
            />
          </div>
        </div>

        {loading && <LoadingScreen />}
      </div>
    </ConfigProvider>
  );
}
