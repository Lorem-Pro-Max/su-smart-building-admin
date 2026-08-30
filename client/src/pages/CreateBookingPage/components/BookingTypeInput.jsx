import { Form, Select } from "antd";
import { useCallback, useEffect, useState } from "react";
import { getBookingTypes } from "@services/booking";

function BookingTypeInput({ setFormData }) {
    const [bookingTypes, setBookingTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoadFailed, setHasLoadFailed] = useState(false);

    const loadBookingTypes = useCallback(() => {
        getBookingTypes()
            .then((data) => {
                setBookingTypes(data);
                setHasLoadFailed(false);
            })
            .catch(() => {
                setBookingTypes([]);
                setHasLoadFailed(true);
            })
            .finally(() => setIsLoading(false));
    }, []);

    useEffect(() => {
        loadBookingTypes();
    }, [loadBookingTypes]);

    const handleRetry = () => {
        setIsLoading(true);
        loadBookingTypes();
    };

    return (
        <Form.Item
            label="ประเภทการจอง"
            name="bookingTypeId"
            rules={[{ required: true, message: "กรุณาเลือกประเภทการจอง" }]}
            extra={
                hasLoadFailed ? (
                    <span className="text-[12px] text-red-500">
                        โหลดประเภทการจองไม่สำเร็จ{" "}
                        <button
                            type="button"
                            className="underline cursor-pointer"
                            onClick={handleRetry}
                        >
                            ลองใหม่
                        </button>
                    </span>
                ) : null
            }
        >
            <Select
                placeholder={hasLoadFailed ? "โหลดประเภทการจองไม่สำเร็จ" : "เลือกประเภทการจอง"}
                loading={isLoading}
                status={hasLoadFailed ? "error" : undefined}
                options={bookingTypes.map((bookingType) => ({
                    value: bookingType.id,
                    label: bookingType.name,
                }))}
                onChange={(value, option) =>
                    setFormData((prev) => ({
                        ...prev,
                        bookingTypeId: value,
                        bookingTypeName: option?.label ?? null,
                    }))
                }
            />
        </Form.Item>
    );
}

export default BookingTypeInput;
