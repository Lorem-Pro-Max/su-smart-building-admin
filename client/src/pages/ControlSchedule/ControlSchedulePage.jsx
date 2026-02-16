import { useState } from "react";
import { Flex, Button } from "antd";
import SchedulePanel from "./components/SchedulePanel";
import { PlusOutlined } from "@ant-design/icons";
import CalendarComponent from "./components/CalendarComponent";

function ControlSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [isOpenCreateEvent, setIsOpenCreateEvent] = useState(false);
  console.log({ isOpenCreateEvent });

  return (
    <>
      {!isOpenCreateEvent && (
        <>
          <Flex className="flex items-center justify-between !pr-8 !pt-8 !pb-4">
            <h3 className="flex items-center gap-2 text-[20px] font-semibold">
              <img
                src="/src/assets/icons/schedule/title.svg"
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
          <div className="flex justify-center mt-10">
            <div>
              <img
                src="/src/assets/images/schedule/emptyPage.svg"
                alt="title"
                className="w-[160px] h-[160px]"
              />
              <div className="font-[18px] mt-4">
                ยังไม่มีการตั้งเวลา เปิด-ปิด
              </div>
            </div>
          </div>
        </>
      )}
      {isOpenCreateEvent && (
        <div style={{ display: "flex" }}>
          <CalendarComponent
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
          <SchedulePanel
            selectedDate={selectedDate}
            onClose={() => setSelectedDate(null)}
          />
        </div>
      )}
    </>
  );
}

export default ControlSchedulePage;
