import { Alert, Col, Form, Row, TimePicker } from "antd";
import { ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
    getApprovedBookingsForRoomOnDate,
    getConflictingApprovedBookings,
} from "../utils/bookingAvailability";
import {
    BOOKING_TIME_FORMAT,
    buildDisabledTime,
    formatTime,
} from "../utils/bookingTime";

function TimeInput({ setFormData, date, bookings = [], selectedRoom }) {
    const form = Form.useFormInstance();
    const startTime = Form.useWatch("startTime", form);
    const endTime = Form.useWatch("endTime", form);

    const startTimeText = formatTime(startTime);
    const endTimeText = formatTime(endTime);
    const dateStr = date ? dayjs(date).format("YYYY-MM-DD") : "";

    const approvedForRoom = selectedRoom
        ? getApprovedBookingsForRoomOnDate(bookings, dateStr, selectedRoom.id)
        : [];

    const isTimeRangeInvalid = Boolean(
        startTimeText && endTimeText && endTimeText <= startTimeText
    );

    const conflictingBookings = selectedRoom && !isTimeRangeInvalid
        ? getConflictingApprovedBookings(
            bookings,
            dateStr,
            selectedRoom.id,
            startTimeText,
            endTimeText
        )
        : [];

    const handleChangeStartTime = (value) => {
        const nextStartTime = formatTime(value);
        const shouldClearEndTime = nextStartTime && endTimeText && endTimeText <= nextStartTime;

        form.setFieldsValue({
            startTime: value ?? null,
            ...(shouldClearEndTime ? { endTime: null } : {}),
        });

        setFormData((prev) => ({
            ...prev,
            startTime: nextStartTime,
            endTime: shouldClearEndTime ? null : prev.endTime,
        }));
    };

    const handleChangeEndTime = (value) => {
        form.setFieldsValue({ endTime: value ?? null });
        setFormData((prev) => ({ ...prev, endTime: formatTime(value) }));
    };

    return (
        <>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label="เวลาเริ่ม" name="startTime" required>
                        <TimePicker
                            format={BOOKING_TIME_FORMAT}
                            minuteStep={1}
                            showNow={false}
                            needConfirm={false}
                            placeholder="--:--"
                            popupClassName="booking-hours-panel"
                            className="w-full"
                            suffixIcon={<ClockCircleOutlined />}
                            disabledTime={buildDisabledTime({ selectedDate: date })}
                            onChange={handleChangeStartTime}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label="เวลาสิ้นสุด" name="endTime" required>
                        <TimePicker
                            format={BOOKING_TIME_FORMAT}
                            minuteStep={1}
                            showNow={false}
                            needConfirm={false}
                            placeholder="--:--"
                            popupClassName="booking-hours-panel"
                            className="w-full"
                            suffixIcon={<ClockCircleOutlined />}
                            disabledTime={buildDisabledTime({
                                selectedDate: date,
                                minTime: startTimeText,
                            })}
                            onChange={handleChangeEndTime}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <BookedRangesHint approvedForRoom={approvedForRoom} hasRoom={Boolean(selectedRoom)} />

            {isTimeRangeInvalid ? (
                <Alert
                    type="error"
                    showIcon
                    className="mb-2"
                    message="ช่วงเวลาไม่ถูกต้อง"
                    description={`เวลาสิ้นสุด (${endTimeText}) ต้องมากกว่าเวลาเริ่ม (${startTimeText})`}
                />
            ) : null}

            {conflictingBookings.length > 0 ? (
                <Alert
                    type="error"
                    showIcon
                    className="mb-2"
                    message="ช่วงเวลานี้ถูกจองแล้ว"
                    description={`ห้อง ${selectedRoom.title} ไม่ว่างช่วง ${formatBookingRanges(conflictingBookings)} กรุณาเลือกเวลาอื่นหรือเปลี่ยนห้อง`}
                />
            ) : null}
        </>
    );
}

function BookedRangesHint({ approvedForRoom, hasRoom }) {
    if (!hasRoom || approvedForRoom.length === 0) return null;

    return (
        <p className="mb-2 text-[12px] text-gray-500">
            ช่วงที่ไม่ว่างของห้องนี้: {formatBookingRanges(approvedForRoom)}
        </p>
    );
}

function formatBookingRanges(bookingList) {
    return bookingList
        .slice()
        .sort((first, second) => dayjs(first.start_dateTime) - dayjs(second.start_dateTime))
        .map(
            (booking) =>
                `${dayjs(booking.start_dateTime).format(BOOKING_TIME_FORMAT)} - ${dayjs(booking.end_dateTime).format(BOOKING_TIME_FORMAT)}`
        )
        .join(", ");
}

export default TimeInput;
