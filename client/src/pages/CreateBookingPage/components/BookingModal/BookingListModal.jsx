import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import BookingCard from './BookingCard';
import dayjs from 'dayjs'
import { getAvailabilityColor } from '../../utils/bookingAvailability';


function BookingListModal({ isModalOpen, setIsModalOpen, bookings, availabilityMap, loading }) {
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    const dateKey =
        bookings?.[0]?.booking_date
            ? dayjs(bookings[0].booking_date).format("YYYY-MM-DD")
            : null;

    const percent =
        dateKey && availabilityMap?.[dateKey] !== undefined
            ? Number(availabilityMap[dateKey])
            : null;
    return (
        <>
            <Modal
                title="สถานะการจองห้อง"
                open={isModalOpen}
                footer={null}
                onCancel={handleCancel}
                centered
                loading={loading}
            >
                <div className='flex gap-2 pb-3'>
                    <div
                        className={`rounded-full w-7 h-7 ${getAvailabilityColor(percent)}`}
                    />
                    <span className="text-2xl">
                        {dateKey
                            ? dayjs(dateKey).format("DD MMM YYYY")
                            : ""}
                    </span>
                </div>
                <div className="max-h-110 2xl:max-h-250 overflow-y-auto overflow-x-hidden space-y-4 px-2">
                    <BookingCard bookings={bookings} />
                </div>
            </Modal >
        </>
    );
};
export default BookingListModal