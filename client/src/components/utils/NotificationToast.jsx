import { notification } from "antd";
import { WarningSignIcon } from "@assets/icons";

export const useToast = () => {
  const [api, contextHolder] = notification.useNotification({
    stack: { threshold: 2 },
  });

  const notify = (type, message, duration = 3) => {
    const isError = type === "error";

    const description =
      typeof message === "object"
        ? message.message || message.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ"
        : message;

    api[type]({
      key: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: isError ? "ดำเนินการล้มเหลว" : "ดำเนินการสำเร็จ",
      description: String(description),
      placement: "topRight",
      duration: duration,
      style: {
        backgroundColor: isError ? "#FFF1F0" : "#F6FFED",
        border: `1px solid ${isError ? "#FFA39E" : "#B7EB8F"}`,
      },
    });
  };

  return {
    successToast: (msg, duration) => notify("success", msg, duration),
    errorToast: (msg, duration) => notify("error", msg, duration),
    contextHolder,
  };
};

export const useIdleWarning = () => {
  const [api, contextHolder] = notification.useNotification({
    stack: { threshold: 5 },
  });

  const idleToast = (data) => {
    const key = `idle-${data.floor}-${data.room}`;

    api.info({
      key,
      message: (
        <div className="flex flex-col gap-1">
          <span className="text-[#000000A6] text-sm flex gap-2">
            <span>{data.date}</span>
            <span>{data.time}</span>
          </span>
          <span className="font-medium text-lg text-[#434343]">
            {data.title}
          </span>
        </div>
      ),
      description: (
        <div className="mt-2">
          <span className="text-[#13C2C2] font-medium">
            {data.room} ชั้น {data.floor}
          </span>
          <span className="text-[#000000D9] font-normal">
            {" "}
            กำลังจะปิดภายใน {data.remaining_time} นาที
          </span>
          <div className=" text-[#000000D9] font-normal text-sm ">
            เนื่องจากระบบไม่พบความเคลื่อนไหวภายในห้อง
          </div>
        </div>
      ),
      placement: "topRight",
      duration: 0,
      icon: <WarningSignIcon />,
      className: "idle-warning-toast",
      style: {
        fontFamily: "var(--font-main)",
        fontWeight: 400,
        width: 380,
        borderRadius: "8px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
      },
    });
  };

  return { idleToast, contextHolder };
};
