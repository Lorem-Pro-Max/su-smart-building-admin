import { Form, Input } from "antd";

export function PhoneInput({ setFormData }) {
    const form = Form.useFormInstance();

    const formatPhoneNumber = (value) => {
        if (!value) return value;

        const phoneNumber = value.replace(/[^\d]/g, "");

        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength <= 10) {

            if (phoneNumberLength < 4) { return phoneNumber };

            if (phoneNumberLength < 7) {
                return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
            }

            return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
        }
        return value.slice(0, 12);
    };

    const handlePhoneChange = (e) => {
        const rawValue = e.target.value;
        const formattedValue = formatPhoneNumber(rawValue);

        form.setFieldsValue({ phone: formattedValue });

        if (setFormData) {
            setFormData((prev) => ({ ...prev, phone: formattedValue }));
        }
    };

    return (
        <Form.Item
            label="เบอร์โทรศัพท์"
            name="phone"
            validateTrigger="onSubmit"
            rules={[
                {
                    pattern: /^\d{3}-\d{3}-\d{4}$/,
                    message: "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (เช่น 081-234-5678)"
                }
            ]}
        >
            <Input
                placeholder="0xx-xxx-xxxx"
                onChange={handlePhoneChange}
                maxLength={12}
            />
        </Form.Item>
    );
}

export default PhoneInput;