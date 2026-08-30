import Building from "@assets/images/create-booking/building.svg";
import RoomSeatInfo from "./RoomSelection/RoomSeatInfo";
import dayjs from "dayjs"
import { createBooking } from "@services/booking";
import { notification } from 'antd';

export function SubmitModalBody({ formData, setIsSubmitModalOpen, setLoading, onSuccess }) {
    const handleSubmit = async (form) => {
        try {
            setLoading(true)
            setIsSubmitModalOpen(false)
            const {
                title,
                room,
                selectedDate,
                phone,
                startTime,
                endTime,
                bookingTypeId,
                purpose,
            } = form;

            const booking_date = dayjs(selectedDate).format("YYYY-MM-DD");

            const start_dateTime = dayjs(
                `${booking_date} ${startTime}`,
                "YYYY-MM-DD HH:mm"
            ).toISOString();

            const end_dateTime = dayjs(
                `${booking_date} ${endTime}`,
                "YYYY-MM-DD HH:mm"
            ).toISOString();

            if (!dayjs(end_dateTime).isAfter(start_dateTime)) {
                throw new Error("เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม");
            }

            const payload = {
                meeting_name: title,
                room_id: Number(room.id),
                phone: phone || null,
                booking_date,
                start_dateTime,
                end_dateTime,
                booking_type_id: bookingTypeId,
                purpose: purpose?.trim() || null,
            };

            const result = await createBooking(payload);
            notification.success({
                message: 'จองห้องสำเร็จ',
                description: 'ระบบอนุมัติการจองให้อัตโนมัติ และตั้งเวลาเปิดห้องตามช่วงเวลาที่จองเรียบร้อยแล้ว',
                placement: 'topRight',
                duration: 3,
                style: {
                    backgroundColor: '#F6FFED', // พื้นหลังเขียวอ่อน
                    border: '1px solid #B7EB8F', // ขอบเขียว
                    borderRadius: '8px',
                    fontFamily: 'Kanit, sans-serif',
                },
            });
            setIsSubmitModalOpen(false);
            setLoading(false)
            onSuccess?.();
        } catch (err) {
            setLoading(false)
            notification.error({
                message: 'ส่งคำขอการจองห้องไม่สำเร็จ',
                description: err.response?.data?.error ?? err.response?.data?.message ?? 'กรุณาลองใหม่อีกครั้ง หรือติดต่อผู้ดูแลระบบ',
                placement: 'topRight',
                duration: 4,
                style: {
                    backgroundColor: '#FFF1F0', // พื้นหลังแดง/ชมพูอ่อน
                    border: '1px solid #FFCCC7', // ขอบแดงอ่อน
                    borderRadius: '8px',
                    fontFamily: 'Kanit, sans-serif',
                },
            });
            console.error(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-xl">สรุปข้อมูลการจอง</h1>
            <p>โปรดตรวจสอบรายละเอียดก่อนยืนยันการจอง</p>
            <div className="w-full mb-5 flex flex-col gap-4 border border-mint-dark rounded-xl p-6 ">
                <h1 className="text-xl">{formData?.title}</h1>
                <div className="w-full rounded-xl p-5 shadow-md border border-gray-200">
                    <div className="flex gap-2 mb-2">
                        <div className="bg-mint-dark p-4 rounded-xl">
                            <img src={Building} />
                        </div>
                        <div className="flex flex-col justify-center">
                            <span>{formData?.room.title}</span>
                            <span>ชั้น {formData?.room.floor}</span>
                            <RoomSeatInfo
                                studySeats={formData?.room.study_seats}
                                examSeats={formData?.room.exam_seats}
                            />
                        </div>
                    </div>
                    <span>{formData?.room.building_name}</span>
                </div>
                <div>
                    <p className="text-sm text-gray-500 font-normal">ชื่อ-นามสกุลผู้จอง</p>
                    <p className="text-lg text-gray-900 font-bold">{formData?.userName || "-"}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">เบอร์โทรศัพท์</p>
                    <p className="text-base text-gray-900 font-semibold">{formData?.phone || "-"}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">วันที่ทำการจอง</p>
                    <p className="text-base text-gray-900 font-semibold">
                        {formData?.selectedDate?.format("DD MMM YYYY")}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">เวลาที่ต้องการจอง</p>
                    <p className="text-base text-gray-900 font-semibold">
                        {formData?.startTime} - {formData?.endTime}
                    </p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">ประเภทการจอง</p>
                    <p className="text-base text-gray-900 font-semibold">{formData?.bookingTypeName || "-"}</p>
                </div>

                <div>
                    <p className="text-sm text-gray-500">เหตุผลการจอง</p>
                    <p className="text-base text-gray-900 font-semibold whitespace-pre-wrap">{formData?.purpose?.trim() || "-"}</p>
                </div>
            </div>
            <div className="w-full flex flex-col gap-2">
                <button
                    className="w-full rounded-lg bg-mint-dark py-2 text-white! hover:cursor-pointer"
                    onClick={() => handleSubmit(formData)}>
                    ยืนยันการจอง
                </button>
                <button className="w-full rounded-lg border border-[#D9D9D9] py-2 text-[#595959] hover:bg-gray-50 transition hover:cursor-pointer" onClick={() => { setIsSubmitModalOpen(false) }}>แก้ไขข้อมูลการจอง</button>
            </div>
        </div>)
}