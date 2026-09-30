import { useNavigate } from "react-router-dom";
import { RoomBadgeIcon, RoomChairIcon } from "@assets/icons";
import { getRoomPath } from "@/lib/roomSlug";

const badgeTextStyle = {
  fontFamily: "var(--font-main)",
  fontWeight: 400,
  fontSize: 14,
  lineHeight: "20px",
  letterSpacing: "0.0025em",
  color: "rgba(0, 0, 0, 0.45)",
};

const metaRegularStyle = {
  fontFamily: "var(--font-main)",
  fontWeight: 400,
  fontSize: 16,
  lineHeight: "24px",
  letterSpacing: "0.005em",
  color: "#000000",
};

const metaMediumStyle = {
  ...metaRegularStyle,
  fontWeight: 500,
};

function DeviceBadge({ Icon, on, total }) {
  const dotColor = on > 0 ? "#73D13D" : "rgba(0, 0, 0, 0.25)";
  const iconColor = on > 0 ? "#13C2C2" : "rgba(0, 0, 0, 0.25)";

  return (
    <div className="flex items-center" style={{ gap: 4, padding: 4 }}>
      <Icon color={iconColor} />
      <span
        className="w-2 h-2 rounded-full shrink-0"
        style={{ background: dotColor }}
      />
      <span style={badgeTextStyle}>
        {on}/{total}
      </span>
    </div>
  );
}

function RoomOverviewCard({ room, groups }) {
  const navigate = useNavigate();

  return (
    <div
      className="flex flex-col items-start"
      style={{
        background: "#FFFFFF",
        borderRadius: 12,
        padding: "20px 24px",
        gap: 4,
        boxShadow: "1px 2px 10px 0px rgba(142, 142, 142, 0.25)",
      }}
    >
      <div className="flex items-center justify-between w-full" style={{ height: 48 }}>
        <div
          className="flex items-center"
          style={{
            background: "#E6FFFB",
            borderRadius: 12,
            padding: "4px 12px",
            gap: 8,
          }}
        >
          <RoomBadgeIcon />
          <span
            style={{
              fontFamily: "var(--font-main)",
              fontWeight: 500,
              fontSize: 18,
              lineHeight: "32px",
              letterSpacing: "0.0025em",
              color: "#000000",
            }}
          >
            {room.name}
          </span>
        </div>

        <div className="flex items-center" style={{ gap: 24 }}>
          <div
            className="flex items-start"
            style={{
              gap: 16,
              background: "#F8F8F8",
              borderRadius: 8,
              padding: "2px 4px",
            }}
          >
            {groups.map((group) => (
              <DeviceBadge
                key={group.key}
                Icon={group.Icon}
                on={room.counts[group.key]?.on ?? 0}
                total={room.counts[group.key]?.total ?? 0}
              />
            ))}
          </div>

          {/* TODO: room open/closed status has no data source yet - placeholder */}
          <div className="flex items-center" style={{ padding: "0 12px", gap: 8 }}>
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: "#52C41A" }}
            />
            <span
              style={{
                fontFamily: "var(--font-main)",
                fontWeight: 500,
                fontSize: 18,
                lineHeight: "24px",
                letterSpacing: "0.005em",
                color: "rgba(0, 0, 0, 0.85)",
              }}
            >
              Open
            </span>
          </div>
        </div>
      </div>

      <div
        className="flex items-center justify-between w-full"
        style={{ height: 40, paddingLeft: 12 }}
      >
        <div className="flex items-center" style={{ gap: 16 }}>
          <div className="flex items-center" style={{ gap: 8 }}>
            <span style={metaRegularStyle}>ชั้น</span>
            <span style={metaMediumStyle}>{room.floor}</span>
          </div>

          <div className="flex items-center" style={{ gap: 4 }}>
            <span style={metaRegularStyle}>ขนาดห้อง</span>
            <RoomChairIcon />
            <div className="flex items-center" style={{ gap: 8 }}>
              <span style={metaMediumStyle}>
                จำนวนนั่งเรียน{" "}
                <span style={{ color: "#08979C" }}>{room.study_seats ?? "-"}</span>{" "}
                คน
              </span>
              <span style={{ width: 1, height: 16, background: "#D9D9D9" }} />
              <span style={metaMediumStyle}>
                จำนวนนั่งสอบ{" "}
                <span style={{ color: "#08979C" }}>{room.exam_seats ?? "-"}</span>{" "}
                คน
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(getRoomPath(room.name, room.floor))}
          style={{
            background: "#13C2C2",
            color: "#FFFFFF",
            borderRadius: 12,
            padding: "0 24px",
            width: 98,
            height: 40,
            fontFamily: "var(--font-main)",
            fontWeight: 500,
            fontSize: 16,
            lineHeight: "24px",
            letterSpacing: "0.005em",
            boxShadow: "0px 2px 0px rgba(5, 145, 255, 0.1)",
            border: "none",
            cursor: "pointer",
          }}
        >
          ดูข้อมูล
        </button>
      </div>
    </div>
  );
}

export default RoomOverviewCard;
