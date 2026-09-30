import { Button } from "antd";

export function HeaderButton({ text, borderColor, bgColor, color }) {
  return (
    <Button
      style={{
        fontFamily: "var(--font-main)",
        fontWeight: 500,
        borderWidth: "1px",
        borderColor: borderColor,
        color: color,
        backgroundColor: bgColor,
        fontSize: "18px",
        borderRadius: "12px",
        padding: "4px 16px",
        height: "100%",
      }}
    >
      <p>{text}</p>
    </Button>
  );
}
