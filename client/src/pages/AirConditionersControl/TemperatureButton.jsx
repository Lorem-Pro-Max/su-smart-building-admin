import { Button, Popover, Slider, InputNumber } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useState } from "react";

const POINTS = [0, 20, 35, 40];
const marks = {
  0: {
    style: {
      color: "rgba(0, 0, 0, 0.45)",
      transform: "translateX(-60%)",
      fontWeight: 400,
    },
    label: "0°C",
  },
  1: {
    style: {
      color: "rgba(0, 0, 0, 0.65)",
      fontWeight: 400,
    },
    label: "20°C",
  },
  2: {
    style: {
      color: "rgba(0, 0, 0, 0.65)",
      fontWeight: 400,
    },
    label: "35°C",
  },
  3: {
    style: {
      color: "#FF5500",
      transform: "translateX(-60%)",
    },
    label: "40°C",
  },
};

function TemperatureSelection({ room, onConfirm }) {
  const [rangeIndices, setRangeIndices] = useState([1, 2]);
  const [targetTemp, setTargetTemp] = useState(room?.temp || 25);

  const minLimit = POINTS[rangeIndices[0]];
  const maxLimit = POINTS[rangeIndices[1]];

  const handleSliderChange = (newIndices) => {
    setRangeIndices(newIndices);

    const newMin = POINTS[newIndices[0]];
    const newMax = POINTS[newIndices[1]];

    if (targetTemp < newMin) setTargetTemp(newMin);
    if (targetTemp > newMax) setTargetTemp(newMax);
  };

  const handleStep = (step) => {
    const newVal = targetTemp + step;
    if (newVal >= minLimit && newVal <= maxLimit) {
      setTargetTemp(newVal);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-72.5 h-full p-4">
      <div className="w-full h-8.5 flex flex-col justify-start py-0">
        <Slider
          range
          min={0}
          max={3}
          step={1}
          marks={marks}
          value={rangeIndices}
          onChange={handleSliderChange}
          tooltip={{ formatter: (val) => `${POINTS[val]}°C` }}
          style={{ margin: "0 12px" }}
        />
      </div>

      <div className="w-full flex items-stretch gap-2 h-full">
        <div className="w-full flex flex-50 h-full">
          <div className="w-full flex-38 flex justify-start items-center">
            <Button
              icon={<MinusOutlined />}
              onClick={() => handleStep(-1)}
              disabled={targetTemp <= minLimit}
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
              onChange={(val) => {
                if (val !== null) setTargetTemp(val);
              }}
              min={minLimit}
              max={maxLimit}
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
              icon={<PlusOutlined style={{ fontolor: "F5F5F5" }} />}
              onClick={() => handleStep(1)}
              disabled={targetTemp >= maxLimit}
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
            onClick={() => onConfirm(targetTemp)}
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

function TemperatureButton({
  currentActiveId,
  onToggle,
  onTempChange,
  icon,
  loading = false,
  room,
}) {
  if (!room) return null;
  const isOpen = currentActiveId === room.id;

  return (
    <Popover
      content={
        <TemperatureSelection
          room={room}
          onConfirm={(finalTemp) => {
            if (onTempChange) onTempChange(room.id, finalTemp);
            onToggle(room.id, false);
          }}
        />
      }
      align={{ offset: [0, 16] }}
      trigger="click"
      open={isOpen}
      onOpenChange={(val) => onToggle(room.id, val)}
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
        icon={icon}
        loading={loading}
      >
        <p className="text-base tracking-[0.005em] leading-6">
          {room.temp || "--"} ํc
        </p>
      </Button>
    </Popover>
  );
}

export default TemperatureButton;
