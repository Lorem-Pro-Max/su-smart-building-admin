import { Button, Popover, InputNumber } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { AirConditionerTemperatureButtonIcon } from "@assets/icons";

function TemperatureSelection({ roomTemp, onConfirm }) {
  const initialValue = typeof roomTemp === "number" ? roomTemp : 25;
  const [targetTemp, setTargetTemp] = useState(initialValue);

  useEffect(() => {
    if (typeof roomTemp === "number") {
      setTargetTemp(roomTemp);
    }
  }, [roomTemp]);

  const handleStep = (adjustment) => {
    setTargetTemp((prev) => {
      const next = prev + adjustment;
      return next > 40 ? 40 : next < 0 ? 0 : next;
    });
  };

  const handleFinalConfirm = () => {
    let val = Number(targetTemp);
    if (val > 40) val = 40;
    if (val < 0) val = 0;
    onConfirm(val);
  };

  return (
    <div className="flex flex-col gap-2 w-72.5 h-full p-4">
      <div className="w-full flex items-stretch gap-2 h-full">
        <div className="w-full flex flex-50 h-full">
          <div className="w-full flex-38 flex justify-start items-center">
            <Button
              icon={<MinusOutlined />}
              onClick={() => handleStep(-1)}
              style={{
                backgroundColor: "#F5F5F5",
                border: 0,
                height: "24px",
                boxShadow: "rgba(0, 0, 0, 0.02)",
              }}
            />
          </div>

          <div className="w-full flex-49 h-max">
            <InputNumber
              value={targetTemp}
              onChange={setTargetTemp}
              type="number"
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              controls={false}
              className="[&_input]:text-center!"
              style={{
                width: "100%",
                height: "32px",
                fontSize: "14px",
                fontWeight: 400,
                lineHeight: "22px",
              }}
            />
          </div>

          <div className="w-full flex-38 flex justify-end items-center">
            <Button
              icon={<PlusOutlined />}
              onClick={() => handleStep(1)}
              style={{
                backgroundColor: "#F5F5F5",
                border: 0,
                height: "24px",
                boxShadow: "rgba(0, 0, 0, 0.02)",
              }}
            />
          </div>
        </div>

        <div className="w-full flex-50">
          <Button
            type="primary"
            onClick={handleFinalConfirm}
            style={{
              backgroundColor: "#36CFC9",
              fontSize: "16px",
              fontWeight: 500,
              width: "100%",
            }}
          >
            ยืนยัน
          </Button>
        </div>
      </div>
    </div>
  );
}

function TemperatureButton({ roomId, roomTemp, control }) {
  const { activePopoverId, handlePopoverChange, handleTempChange } = control;
  const isOpen = activePopoverId === roomId;

  return (
    <Popover
      content={
        <TemperatureSelection
          roomTemp={roomTemp}
          onConfirm={(finalTemp) => {
            handleTempChange(roomId, finalTemp);
            handlePopoverChange(roomId, false);
          }}
        />
      }
      align={{ offset: [0, 16] }}
      trigger="click"
      open={isOpen}
      onOpenChange={(visible) => handlePopoverChange(roomId, visible)}
      arrow={false}
      placement="bottomRight"
      styles={{
        container: {
          padding: "0",
          borderRadius: "16px",
          boxShadow: "rgba(142, 142, 142, 0.25)",
        },
      }}
    >
      <Button
        size="large"
        type="primary"
        style={{
          background: "var(--color-temperature-button)",
          border: 0,
          color: "#000",
        }}
        icon={<AirConditionerTemperatureButtonIcon />}
      >
        <p className="text-base tracking-[0.005em] leading-6">
          {roomTemp ?? "--"} ํc
        </p>
      </Button>
    </Popover>
  );
}

export default TemperatureButton;
