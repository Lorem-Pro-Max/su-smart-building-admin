import { Badge, Button, DatePicker, Input, Modal, TimePicker } from "antd";
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons";
import { useState } from "react";
import dayjs from "dayjs";
import {
    BOOKING_TIME_FORMAT,
    buildDisabledTime,
    formatTime,
    toTimeOfDay,
} from "../../utils/bookingTime";

const DATE_FORMAT = "DD MMM YYYY";

const toSeatText = (seats) => (seats == null ? "" : String(seats));
const toSeatNumber = (seatText) => (seatText ? Number(seatText) : null);
const keepDigitsOnly = (value) => value.replace(/\D/g, "");

export default function RoomFilter({
    filters,
    onChangeFilters,
    activeFilterCount,
    formDate,
    isOpen,
    setIsOpen,
}) {
    const buildDraft = (overrides = {}) => ({
        minStudySeatsText: toSeatText(filters.minStudySeats),
        minExamSeatsText: toSeatText(filters.minExamSeats),
        date: filters.date ?? formDate ?? null,
        startTime: filters.startTime ?? null,
        endTime: filters.endTime ?? null,
        ...overrides,
    });

    const [draft, setDraft] = useState(buildDraft);

    const updateDraft = (changes) => setDraft((prev) => ({ ...prev, ...changes }));

    const handleOpen = () => {
        setDraft(buildDraft());
        setIsOpen(true);
    };

    const handleChangeDraftStartTime = (value) => {
        const nextStartTime = formatTime(value);
        const shouldClearEndTime =
            nextStartTime && draft.endTime && draft.endTime <= nextStartTime;

        updateDraft({
            startTime: nextStartTime,
            ...(shouldClearEndTime ? { endTime: null } : {}),
        });
    };

    const handleConfirm = () => {
        onChangeFilters({
            minStudySeats: toSeatNumber(draft.minStudySeatsText),
            minExamSeats: toSeatNumber(draft.minExamSeatsText),
            date: draft.date ?? null,
            startTime: draft.startTime,
            endTime: draft.endTime,
        });
        setIsOpen(false);
    };

    const hasIncompleteTimeRange =
        Boolean(draft.startTime) !== Boolean(draft.endTime) ||
        Boolean(draft.startTime && draft.endTime && draft.endTime <= draft.startTime);
    const canConfirm = Boolean(draft.date) && !hasIncompleteTimeRange;

    return (
        <>
            <Badge count={activeFilterCount} size="small" offset={[-4, 2]}>
                <Button
                    icon={<FilterOutlined />}
                    onClick={handleOpen}
                    className="font-main border-mint-dark text-mint-dark"
                >
                    Filter
                </Button>
            </Badge>

            <Modal
                title={
                    <span className="flex items-center gap-2 font-main font-bold">
                        <FilterOutlined className="text-mint-dark" />
                        Filter
                    </span>
                }
                open={isOpen}
                onCancel={() => setIsOpen(false)}
                centered
                width={380}
                footer={null}
            >
                <div className="flex flex-col gap-4 pt-2">
                    <section className="flex flex-col gap-2">
                        <h3 className="m-0 font-medium">จำนวนที่นั่ง</h3>
                        <div className="flex gap-4">
                            <label className="flex flex-col gap-1 flex-1 min-w-0">
                                <span className="text-[13px] text-gray-500">จำนวนที่นั่งเรียน</span>
                                <Input
                                    value={draft.minStudySeatsText}
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="จำนวนที่นั่งเรียน"
                                    onChange={(event) =>
                                        updateDraft({ minStudySeatsText: keepDigitsOnly(event.target.value) })
                                    }
                                />
                            </label>
                            <label className="flex flex-col gap-1 flex-1 min-w-0">
                                <span className="text-[13px] text-gray-500">จำนวนที่นั่งสอบ</span>
                                <Input
                                    value={draft.minExamSeatsText}
                                    inputMode="numeric"
                                    maxLength={4}
                                    placeholder="จำนวนที่นั่งสอบ"
                                    onChange={(event) =>
                                        updateDraft({ minExamSeatsText: keepDigitsOnly(event.target.value) })
                                    }
                                />
                            </label>
                        </div>
                    </section>

                    <section className="flex flex-col gap-2">
                        <h3 className="m-0 font-medium">ช่วงเวลาที่ต้องการใช้ห้อง</h3>

                        <label className="flex flex-col gap-1">
                            <span className="text-[13px] text-gray-500">วันที่</span>
                            <DatePicker
                                value={draft.date ? dayjs(draft.date) : null}
                                format={DATE_FORMAT}
                                allowClear={false}
                                className="w-full"
                                disabledDate={(current) => current && current < dayjs().startOf("day")}
                                onChange={(value) => updateDraft({ date: value })}
                            />
                        </label>

                        <div className="flex gap-4">
                            <label className="flex flex-col gap-1 flex-1 min-w-0">
                                <span className="text-[13px] text-gray-500">เวลาเริ่มต้น</span>
                                <TimePicker
                                    value={toTimeOfDay(draft.startTime, draft.date ?? undefined)}
                                    format={BOOKING_TIME_FORMAT}
                                    minuteStep={1}
                                    showNow={false}
                                    needConfirm={false}
                                    hideDisabledOptions
                                    placeholder="--:--"
                                    className="w-full"
                                    allowClear
                                    disabledTime={buildDisabledTime({ selectedDate: draft.date, blockPastTime: false })}
                                    onChange={handleChangeDraftStartTime}
                                />
                            </label>
                            <label className="flex flex-col gap-1 flex-1 min-w-0">
                                <span className="text-[13px] text-gray-500">เวลาสิ้นสุด</span>
                                <TimePicker
                                    value={toTimeOfDay(draft.endTime, draft.date ?? undefined)}
                                    format={BOOKING_TIME_FORMAT}
                                    minuteStep={1}
                                    showNow={false}
                                    needConfirm={false}
                                    hideDisabledOptions
                                    placeholder="--:--"
                                    className="w-full"
                                    allowClear
                                    disabledTime={buildDisabledTime({
                                        selectedDate: draft.date,
                                        minTime: draft.startTime,
                                        blockPastTime: false,
                                    })}
                                    onChange={(value) => updateDraft({ endTime: formatTime(value) })}
                                />
                            </label>
                        </div>
                    </section>

                    <div className="flex gap-2 pt-1">
                        <button
                            className="w-1/2 h-10 flex items-center justify-center gap-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                            onClick={() =>
                                setDraft(buildDraft({
                                    minStudySeatsText: "",
                                    minExamSeatsText: "",
                                    date: formDate ?? null,
                                    startTime: null,
                                    endTime: null,
                                }))
                            }
                        >
                            <ReloadOutlined />
                            กลับค่าเริ่มต้น
                        </button>
                        <button
                            disabled={!canConfirm}
                            className={`w-1/2 h-10 rounded-lg transition ${canConfirm
                                ? "bg-mint-dark hover:bg-mint-darker text-white! cursor-pointer"
                                : "bg-gray-300 text-white cursor-not-allowed"}`}
                            onClick={handleConfirm}
                        >
                            ยืนยัน
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
