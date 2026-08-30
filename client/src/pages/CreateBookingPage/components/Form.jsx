import { Form, Input, DatePicker, Row, Col, Divider, ConfigProvider, Modal, Spin } from "antd";
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


  const dateStr = date ? dayjs(date).format("YYYY-MM-DD") : "";

  useEffect(() => {
    if (date) {
      setFormData((prev) => ({ ...prev, selectedDate: date }));
      form.setFieldsValue({ date: date });
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
  };

  const handleCreated = () => {
    resetForm();
    onCreated?.();
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
