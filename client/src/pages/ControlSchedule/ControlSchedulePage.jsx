import { useState, useEffect } from "react";
import { Flex, Button, notification } from "antd";

import SchedulePanel from "./components/SchedulePanel";
import { PlusOutlined } from "@ant-design/icons";
import CalendarComponent from "./components/CalendarComponent";
import ScheduleTable from "./components/ScheduleTable";
import DeleteModal from "./components/DeleteModal";
import { getAllSchedule } from "../../services/schedule";

function ControlSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isOpenCreateEvent, setIsOpenCreateEvent] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await getAllSchedule();

      const formatted = (res?.data || []).map((item) => {
        const firstSchedule = item.schedules?.[0];

        const cleanAction = firstSchedule?.action?.replace(/"/g, "") || "";

        const actionTime = firstSchedule?.action_time
          ? new Date(firstSchedule.action_time)
          : null;

        return {
          ...item,
          room_name: item.room?.title,
          device_count: item.schedules?.length || 0,
          operator: firstSchedule?.action_by?.full_name,
          action: cleanAction,
          date: actionTime ? actionTime.toLocaleDateString("th-TH") : "-",
          time: actionTime
            ? actionTime.toLocaleTimeString("th-TH", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-",
        };
      });

      setTableData(formatted);
    } catch (err) {
      console.error(err);
      notification.error({ message: "โหลดข้อมูลไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, []);

  return (
    <>
      {!isOpenCreateEvent && (
        <>
          <Flex className="flex items-center justify-between !pr-8 !pt-4 !pb-4">
            <h3 className="flex items-center gap-2 text-[24px] font-semibold">
              <img
                src="src/assets/icons/schedule/title.svg"
                alt="title"
                className="w-[20px] h-[20px]"
              />
              ตั้งเวลา เปิด-ปิด
            </h3>

            <Button
              icon={<PlusOutlined />}
              color="cyan"
              onClick={() => setIsOpenCreateEvent(true)}
              className="
      !w-[238px]
      !h-[60px]
      !px-6
      !text-[18px]
      !font-medium
      !rounded-xl
    "
            >
              ตั้งเวลาเปิด-ปิด อุปกรณ์
            </Button>
          </Flex>
          {tableData.length > 0 ? (
            <>
              <DeleteModal
                open={isOpenDeleteModal}
                bookingId={bookingId}
                onCancel={() => setIsOpenDeleteModal(false)}
                setBookingId={setBookingId}
                setTableData={setTableData}
              />
              <ScheduleTable
                setBookingId={setBookingId}
                setIsOpenDeleteModal={setIsOpenDeleteModal}
                setTableData={setTableData}
                tableData={tableData}
                loading={loading}
              />
            </>
          ) : (
            <div className="flex justify-center mt-10">
              <div>
                <img
                  src="src/assets/images/schedule/emptyPage.svg"
                  alt="title"
                  className="w-[160px] h-[160px]"
                />
                <div className="font-[18px] mt-4">
                  ยังไม่มีการตั้งเวลา เปิด-ปิด
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {isOpenCreateEvent && (
        <div style={{ display: "flex" }}>
          <CalendarComponent
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            data={tableData}
          />
          <SchedulePanel
            selectedDate={selectedDate}
            onClose={() => {
              setSelectedDate(null);
              setIsOpenCreateEvent(false);
              fetchSchedule();
            }}
          />
        </div>
      )}
    </>
  );
}

export default ControlSchedulePage;
