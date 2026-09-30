import { Button } from "antd";

const textStyle = "text-base tracking-[0.005em] leading-6";

export function CardButton({ icon, text, loading = false, bgColor, style }) {
  return (
    <Button
      size="large"
      type="primary"
      color="primary"
      style={{
        background: bgColor,
        border: 0,
        color: "#FFF",
        ...style,
      }}
      icon={icon}
      ghost={false}
      danger={false}
      shape="default"
      loading={loading}
    >
      <p className={textStyle}>{text}</p>
    </Button>
  );
}

