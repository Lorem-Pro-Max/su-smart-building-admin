import { Button, Popover } from "antd";
import { useState } from "react";

const textStyle = "text-base tracking-[0.005em] leading-6";

export function CardButtonOpen({ icon, text, loading = false }) {
  return (
    <Button
      size="large"
      type="primary"
      color="primary"
      style={{
        background: "#13C2C2",
        border: 0,
        color: "#FFF",
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

export function CardButtonClosed({ icon, text, loading = false }) {
  return (
    <Button
      size="large"
      type="primary"
      style={{
        background: "#FA8C16",
        border: 0,
        color: "#FFF",
      }}
      icon={icon}
      ghost={false}
      danger={false}
      shape="Default"
      loading={loading}
    >
      <p className={textStyle}>{text}</p>
    </Button>
  );
}

