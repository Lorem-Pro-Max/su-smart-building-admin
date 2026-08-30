function SeatIcon({ className }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
            <path d="M6 2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H6Zm-2 10a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h1v4a1 1 0 1 0 2 0v-4h10v4a1 1 0 1 0 2 0v-4h1a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H4Z" />
        </svg>
    );
}

function SeatValue({ seats }) {
    if (seats === null || seats === undefined) {
        return <span className="text-gray-400">-</span>;
    }

    if (Number(seats) === 0) {
        return <span className="text-gray-400">ไม่รองรับ</span>;
    }

    return <span className="text-mint-dark font-medium">{seats} คน</span>;
}

export default function RoomSeatInfo({ studySeats, examSeats, size = "sm" }) {
    const textSizeClass = size === "md" ? "text-[14px]" : "text-[12px]";
    const iconSizeClass = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

    return (
        <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 ${textSizeClass}`}>
            <SeatIcon className={`${iconSizeClass} text-[#FAAD14] shrink-0`} />
            <span className="text-gray-500 whitespace-nowrap">
                จำนวนที่นั่งเรียน <SeatValue seats={studySeats} />
            </span>
            <span className="text-gray-500 whitespace-nowrap border-l border-gray-300 pl-2">
                จำนวนที่นั่งสอบ <SeatValue seats={examSeats} />
            </span>
        </div>
    );
}
