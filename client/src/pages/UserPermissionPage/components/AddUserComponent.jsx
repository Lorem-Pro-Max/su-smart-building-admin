import { Form, Input, Button, Select, notification } from "antd";
import { useEffect, useState, useMemo } from "react";
import { EyeInvisibleOutlined } from "@ant-design/icons";
import { createUser, updateUser } from "../../../services/user";

const { Option } = Select;

function AddUserComponent({ onSuccess, onCancel, editData }) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEdit = useMemo(() => !!editData, [editData]);

  useEffect(() => {
    if (!editData) {
      form.resetFields();
      return;
    }

    form.setFieldsValue({
      username: editData.userName,
      fullName: editData.fullName,
      phone: editData.phone,
      email: editData.email,
      role: editData.position,
    });
  }, [editData, form]);

  const generatePassword = (length = 10) => {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
  };

  const handleGeneratePassword = () => {
    form.setFieldsValue({ password: generatePassword(10) });
  };

  const buildUpdatePayload = (values) => {
    const [firstname, ...rest] = values.fullName.trim().split(/\s+/);

    return {
      firstname,
      lastname: rest.join(" "),
      phone: values.phone,
      email: values.email,
      role_id: values.role,
    };
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      if (isEdit) {
        const payload = buildUpdatePayload(values);

        await updateUser(editData.key, payload);
        notification.success({ message: "แก้ไขข้อมูลผู้ใช้งานสำเร็จ" });
      } else {
        const [firstname, ...last] = values.fullName.trim().split(" ");

        await createUser({
          username: values.username,
          password: values.password,
          firstname,
          lastname: last.join(" "),
          phone: values.phone,
          email: values.email,
          role_id: values.role,
          status: 1,
        });

        notification.success({ message: "เพิ่มผู้ใช้งานสำเร็จ" });
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
      notification.error({ message: "เกิดข้อผิดพลาด" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="text-2xl font-semibold mb-6">
        {isEdit ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งาน"}
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <div
          className={`grid md:grid-cols-${isEdit ? "1" : "2"} grid-cols-1 gap-4`}
        >
          <Form.Item
            label="username"
            name="username"
            rules={[
              { required: true, message: "กรุณากรอก username" },
              { min: 4, message: "username ต้องมากกว่า 4 ตัวอักษร" },
            ]}
          >
            <Input disabled={isEdit} />
          </Form.Item>

          {!isEdit && (
            <div className="flex gap-2 items-start">
              <Form.Item
                label="password"
                name="password"
                className="flex-1"
                rules={[{ required: true }]}
              >
                <Input.Password iconRender={() => <EyeInvisibleOutlined />} />
              </Form.Item>

              <Button
                type="primary"
                className="mt-[30px] !bg-[#13C2C2]"
                onClick={handleGeneratePassword}
              >
                กำหนดรหัสผ่าน
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
          <Form.Item
            label="ชื่อ-นามสกุล"
            name="fullName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="เบอร์โทรศัพท์"
            name="phone"
            rules={[{ required: true }, { pattern: /^[0-9]{10}$/ }]}
          >
            <Input maxLength={10} />
          </Form.Item>
        </div>

        <Form.Item
          label="email"
          name="email"
          rules={[{ required: true }, { type: "email" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Role" name="role" rules={[{ required: true }]}>
          <Select disabled={isEdit}>
            <Option value={1}>Admin</Option>
            <Option value={2}>User</Option>
          </Select>
        </Form.Item>

        <div className="flex justify-end gap-4 mt-20">
          <Button
            className="px-10 h-12 rounded-xl w-[260px]  h-[50px]"
            onClick={onCancel}
          >
            ยกเลิก
          </Button>

          <Button
            htmlType="submit"
            loading={loading}
            variant="solid"
            color="cyan"
            className="px-10 h-12 rounded-xl w-[260px] text-white border-none h-[50px]"
          >
            ยืนยัน
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default AddUserComponent;
