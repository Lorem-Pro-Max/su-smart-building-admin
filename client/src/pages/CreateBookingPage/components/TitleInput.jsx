import { Form, Input } from "antd";
import { EditOutlined, } from "@ant-design/icons";

function TitleInput({ setFormData }) {
    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, title: e.target.value }));
    };
    return (
        <Form.Item
            varient="underlined"
            name="title"
            validateTrigger="onSubmit"
            rules={[{ required: true, message: "กรุณาระบุชื่อการประชุม/การเรียน" }]}
        >
            <Input
                onChange={handleChange}
                placeholder="ระบุชื่อการประชุม/การเรียน"
                className="h-[52px] px-4 custom-booking-input"
                variant="underlined"
                suffix={<EditOutlined style={{ fontSize: "24px", color: "#13C2C2" }} />}
            />
        </Form.Item>
    );
}

export default TitleInput