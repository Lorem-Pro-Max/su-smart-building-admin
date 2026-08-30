import { Form, Input, DatePicker, Row, Col, Divider, ConfigProvider, Modal, Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { useState, useEffect } from "react";
import dayjs from 'dayjs';
import RoomSelection from "./RoomSelection/RoomSelection"
import { getConflictingApprovedBookings } from "../utils/bookingAvailability";
import TitleInput from "./TitleInput";
import TimeInput from "./TimeInput";
import BookingTypeInput from "./BookingTypeInput";
import PurposeInput from "./PurposeInput";
import BookingCard from "./BookingModal/BookingCard";
import PhoneInput from "./PhoneInput";
import { SubmitModalBody } from "./SubmitModalBody";
import ModalImage from "@assets/images/create-booking/notebookModal.png"
import { getCurrentUser } from "../utils/getCurrentUser";
import RecurrenceField from "./Recurrence/RecurrenceField";
import RecurrencePreviewModal from "./Recurrence/RecurrencePreviewModal";
import {
  annotateConflicts,
  buildOccurrences,
  findIntraSetConflicts,
  occurrenceToPayload,
} from "../utils/recurrence";
import { createBookingsBulk, getBookingsInRange } from "@services/booking";
import { notifyBookingError, notifyBookingSuccess } from "../utils/bookingNotify";

function BookingForm({ date, setDate, bookings, rooms, setLoading, loading, onCreated }) {
  const [form] = Form.useForm();
  const userInfo = getCurrentUser()
  const [formData, setFormData] = useState({
    title: "",
    userId: userInfo?.id || null,
    userName: userInfo ? `${userInfo.firstname} ${userInfo.lastname}`.trim() : "",
    room: null,
    selectedDate: date,
    phone: "",
    startTime: null,
    endTime: null,
    bookingTypeId: null,
    bookingTypeName: null,
    purpose: ""
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [recurrence, setRecurrence] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewOccurrences, setPreviewOccurrences] = useState([]);
  const [previewMeta, setPreviewMeta] = useState({ truncated: false, skippedMonths: [] });


  const dateStr = date ? dayjs(date).format("YYYY-MM-DD") : "";

  useEffect(() => {
    if (date) {
      setFormData((prev) => ({ ...prev, selectedDate: date }));
      form.setFieldsValue({ date: date });

      /* วันสิ้นสุดของรูปแบบทำซ้ำอยู่ก่อนวันที่จองใหม่ = รูปแบบใช้ไม่ได้แล้ว
         นอกจากกรณีนี้เก็บรูปแบบไว้: weekday เป็นค่าสัมบูรณ์
         ส่วนวันที่ของเดือน derive จากวันตั้งต้นตอน generate จึงตามวันใหม่เอง */
      if (recurrence?.untilDate && dayjs(recurrence.untilDate).isBefore(dayjs(date), "day")) {
        setRecurrence(null);
        message.info("วันสิ้นสุดของการทำซ้ำอยู่ก่อนวันที่จองใหม่ ระบบจึงล้างรูปแบบการทำซ้ำ");
      }
    }
  }, [date]);

  const preSubmitCheck = async () => {
    try {
      await form.validateFields();

      if (!formData.startTime || !formData.endTime || !formData.room) {
        openErrorModal();
        return;
      }

      if (formData.endTime <= formData.startTime) {
        openErrorModal(`เวลาสิ้นสุด (${formData.endTime}) ต้องมากกว่าเวลาเริ่ม (${formData.startTime}) กรุณาแก้ไขช่วงเวลาที่จอง`);
        return;
      }

      /* ต้องแตกก่อนเช็คชนของวันเดียว: ถ้าเป็นชุด การที่วันตั้งต้นชนไม่ควรบล็อกทั้งงาน
         ควรโผล่เป็นแถวแดงติ๊กออกใน preview แล้วสร้างใบที่เหลือต่อได้ */
      if (recurrence) {
        await openRecurrencePreview();
        return;
      }

      const conflicts = getConflictingApprovedBookings(
        bookings,
        dateStr,
        formData.room.id,
        formData.startTime,
        formData.endTime
      );

      if (conflicts.length > 0) {
        openErrorModal(`ห้อง ${formData.room.title} ถูกจองแล้วในช่วงเวลาที่เลือก กรุณาเลือกเวลาอื่นหรือเปลี่ยนห้อง`);
        return;
      }

      setIsSubmitModalOpen(true);
    } catch (error) {
      openErrorModal();
    }
  };

  const resetForm = () => {
    form.resetFields();
    form.setFieldsValue({ user: formData.userName, date });
    setFormData((prev) => ({
      ...prev,
      title: "",
      room: null,
      selectedDate: date,
      phone: "",
      startTime: null,
      endTime: null,
      bookingTypeId: null,
      bookingTypeName: null,
      purpose: "",
    }));

    setRecurrence(null);
    setPreviewOccurrences([]);
    setIsPreviewOpen(false);
    setPreviewMeta({ truncated: false, skippedMonths: [] });
  };

  const handleCreated = () => {
    resetForm();
    onCreated?.();
  };

  const openRecurrencePreview = async () => {
    const { occurrences, truncated, skippedMonths } = buildOccurrences({
      anchorDate: date,
      pattern: recurrence,
      startTime: formData.startTime,
      endTime: formData.endTime,
    });

    if (occurrences.length === 0) {
      openErrorModal("รูปแบบการทำซ้ำนี้ไม่มีวันที่ที่จองได้ กรุณาแก้ไขรูปแบบหรือวันสิ้นสุด");
      return;
    }

    setLoading(true);
    try {
      /* เช็คชนล่วงหน้าเท่านั้น ตัวตัดสินจริงคือ WHERE NOT EXISTS ฝั่ง server */
      const existing = await getBookingsInRange(
        occurrences[0].dateStr,
        occurrences[occurrences.length - 1].dateStr,
        formData.room.id,
      );

      let annotated = annotateConflicts(
        occurrences,
        existing,
        formData.room.id,
        formData.startTime,
        formData.endTime,
      );

      /* ปัจจุบันเป็นไปไม่ได้ (dedupe รายวัน) แต่กันไว้เผื่อวันหลังแก้เวลารายครั้งได้ */
      const intraSet = new Set(findIntraSetConflicts(annotated).map(([, later]) => later.key));
      if (intraSet.size > 0) {
        annotated = annotated.map((item) =>
          intraSet.has(item.key) && item.conflicts.length === 0
            ? { ...item, conflicts: [{ start_dateTime: item.startAt, end_dateTime: item.endAt }] }
            : item,
        );
      }

      setPreviewOccurrences(annotated);
      setPreviewMeta({ truncated, skippedMonths });
      setIsPreviewOpen(true);
    } catch (err) {
      openErrorModal(
        err.response?.data?.error ?? err.message ?? "ตรวจสอบเวลาว่างไม่สำเร็จ",
      );
    } finally {
      setLoading(false);
    }
  };

  /* การเรียก API อยู่ที่นี่ ไม่ใช่ใน preview modal (ต่างจาก SubmitModalBody ที่ถือ createBooking เอง)
     เพราะ modal มี interactive state จริง (selection / indeterminate / empty state)
     ที่ควรเก็บให้เป็น presentational ล้วน — ไม่ได้ลืมย้าย */
  const handleConfirmRecurrence = async (selected) => {
    setIsPreviewOpen(false);
    setLoading(true);

    try {
      const result = await createBookingsBulk({
        meeting_name: formData.title,
        room_id: Number(formData.room.id),
        phone: formData.phone || null,
        booking_type_id: formData.bookingTypeId,
        purpose: formData.purpose?.trim() || null,
        occurrences: selected.map(occurrenceToPayload),
      });

      reportRecurrenceResult(result);

      /* รีเซ็ตฟอร์มเฉพาะเมื่อมีใบถูกสร้างจริง — ถ้าชนหมด แอดมินแค่ต้องเปลี่ยนเวลา
         ไม่ควรโดนล้างห้อง/หัวข้อ/ประเภทที่กรอกมาแล้วทิ้ง */
      if ((result.summary?.created ?? 0) > 0) {
        handleCreated();
      }
    } catch (err) {
      /* บางก้อน commit ไปแล้ว ต้องไม่ทิ้งยอดที่สำเร็จไปกับ error
         และต้องยิง toast เดียว ไม่ใช่เขียวซ้อนแดง */
      if (err.partial?.created?.length) {
        reportRecurrenceResult(
          {
            ...err.partial,
            summary: {
              created: err.partial.created.length,
              skipped: err.partial.skipped.length,
            },
          },
          { interrupted: true },
        );
        handleCreated();
      } else {
        notifyBookingError(err, { message: "สร้างการจองต่อเนื่องไม่สำเร็จ" });
      }
    } finally {
      setLoading(false);
    }
  };

  /* รายงานด้วยตัวเลขจาก server เท่านั้น ระหว่าง preview กับตอนสร้างอาจมีคนจองแทรก
     แยก skipped ตาม reason ด้วย เพราะ ERROR (DB พัง) ไม่ใช่ CONFLICT (ห้องไม่ว่าง)
     ถ้าเหมารวมว่า "ชนเวลา" แอดมินจะเข้าใจผิดว่าต้องเปลี่ยนเวลาทั้งที่ระบบมีปัญหา */
  const reportRecurrenceResult = (result, { interrupted = false } = {}) => {
    const createdCount = result.summary?.created ?? result.created?.length ?? 0;
    const skippedList = result.skipped ?? [];

    const conflicts = skippedList.filter((item) => item.reason !== "ERROR");
    const errors = skippedList.filter((item) => item.reason === "ERROR");

    const formatDates = (list) =>
      list
        .map((item) => dayjs(item.bookingDate ?? item.booking_date).format("DD MMM"))
        .join(", ");

    const reasons = [];
    if (conflicts.length) {
      reasons.push(`ชนกับการจองอื่น ${conflicts.length} รายการ: ${formatDates(conflicts)}`);
    }
    if (errors.length) {
      reasons.push(`เกิดข้อผิดพลาด ${errors.length} รายการ: ${formatDates(errors)}`);
    }

    if (createdCount === 0) {
      notifyBookingError(null, {
        message: "ไม่สามารถสร้างการจองได้",
        description:
          reasons.join(" · ") || "ไม่มีรายการใดถูกสร้าง กรุณาตรวจสอบเวลาและห้องอีกครั้ง",
      });
      return;
    }

    /* สร้างได้บางส่วนแล้วหยุดกลางคัน = ไม่ครบตามที่กดยืนยัน ต้องใช้ toast แดงให้สังเกตเห็น */
    if (interrupted) {
      notifyBookingError(null, {
        message: `สร้างการจองได้ ${createdCount} รายการ แล้วหยุดกลางคัน`,
        description: [
          "ระบบหยุดก่อนสร้างครบตามที่เลือก กรุณาตรวจสอบรายการที่เหลือแล้วสร้างเพิ่ม",
          ...reasons,
        ].join(" · "),
      });
      return;
    }

    notifyBookingSuccess({
      message: `จองห้องสำเร็จ ${createdCount} รายการ`,
      description: reasons.length
        ? `ข้าม ${skippedList.length} รายการ — ${reasons.join(" · ")}`
        : "ระบบอนุมัติการจองให้อัตโนมัติ และตั้งเวลาเปิดห้องตามช่วงเวลาที่จองเรียบร้อยแล้ว",
      duration: reasons.length ? 8 : 3,
    });
  };

  const openErrorModal = (message = null) => {
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-5 bg-white">
        <ConfigProvider
          theme={{
            components: {
              Form: {
                itemMarginBottom: 8,
              },
            },
          }}
        >
          <Form form={form} layout="vertical" className="flex flex-col gap-2 " initialValues={{
            user: formData.userName, // แสดงชื่อผู้จองทันที
            date: date
          }}>
            <TitleInput setFormData={setFormData} />
            <RoomSelection
              setFormData={setFormData}
              formData={formData}
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              rooms={rooms}
              bookings={bookings}
              selectedDate={date}
            />
            <UserInfo />
            <Row gutter={16}>
              <Col span={12}>
                <DateInput date={date} setDate={setDate} />
              </Col>
              <Col span={12}>
                <PhoneInput setFormData={setFormData} />
              </Col>
            </Row>
            <div className="-mt-1 mb-2">
              <RecurrenceField
                anchorDate={date}
                value={recurrence}
                onChange={setRecurrence}
              />
            </div>
            <TimeInput setFormData={setFormData} date={date} bookings={bookings} selectedRoom={formData.room} />
            <BookingTypeInput setFormData={setFormData} />
            <PurposeInput setFormData={setFormData} />
          </Form>
        </ConfigProvider>
        <Divider></Divider>
        <p>สถานะการจองห้อง</p>
        <div className="max-h-80 2xl:max-h-120 overflow-y-auto overflow-x-hidden space-y-4 px-2">
          <BookingCard bookings={bookings} /></div>
      </div>
      <div className="mt-auto sticky bottom-0 bg-white">
        <button
          className="w-full sm:w-1/2 h-10 border border-gray-300 text-gray-700 hover:bg-gray-100 transition hover:cursor-pointer"
          onClick={resetForm}
        >
          ยกเลิก
        </button>
        <button
          className={` w-full sm:w-1/2 h-10 hover:cursor-pointer text-white! transition ${!isErrorModalOpen ? "bg-mint-dark hover:bg-mint-darker" : "bg-gray-300 cursor-not-allowed"}`}
          onClick={preSubmitCheck}
        >
          ยืนยัน
        </button>
      </div>
      <Modal
        title="รายละเอียดการจอง"
        open={isSubmitModalOpen}
        onCancel={() => setIsSubmitModalOpen(false)}
        centered
        footer={null}
      >
        <SubmitModalBody formData={formData} setIsSubmitModalOpen={setIsSubmitModalOpen} setLoading={setLoading} onSuccess={handleCreated} />
      </Modal>
      <RecurrencePreviewModal
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        onConfirm={handleConfirmRecurrence}
        occurrences={previewOccurrences}
        room={formData.room}
        pattern={recurrence}
        anchorDate={date}
        startTime={formData.startTime}
        endTime={formData.endTime}
        loading={loading}
        truncated={previewMeta.truncated}
        skippedMonths={previewMeta.skippedMonths}
      />
      <Modal title={null} open={isErrorModalOpen} onCancel={() => setIsErrorModalOpen(false)} centered footer={null}>
        <div className="flex flex-col items-center">
          <img src={ModalImage} />
          {errorMessage ? (
            <p className="text-center">{errorMessage}</p>
          ) : (
            <>
              <p>กรุณากรอกข้อมูลให้ครบถ้วน  </p>
              <p>โปรดตรวจสอบและระบุข้อมูลให้ครบถ้วนก่อนกดยืนยัน </p>
            </>
          )}
          <button className="w-full rounded-lg border border-[#D9D9D9] py-2 text-[#595959] hover:bg-gray-50 transition hover:cursor-pointer" onClick={() => { setIsErrorModalOpen(false) }}>ปิด</button>
        </div>
      </Modal>
    </div >
  );
}

function UserInfo() {
  return (
    <Form.Item
      name="user"
      label="ชื่อ-นามสกุลผู้จอง"
      rules={[{ required: true, message: "Please input!" }]}
    >
      <Input
        variant="boarderless" disabled
      />
    </Form.Item>
  );
}

function DateInput({ date, setDate, }) {
  const handleChange = (date, dateString) => {
    setDate(date)
  };
  const dateFormat = 'DD MMM YYYY';

  const disablePastDates = (current) => {
    return current && current < dayjs().startOf("day");
  };

  return (
    <Form.Item label="วันที่" name="date" required>
      <DatePicker
        format={dateFormat}
        onChange={handleChange}
        className="w-full"
        disabledDate={disablePastDates}
      />
    </Form.Item>
  );
}


export default BookingForm;
