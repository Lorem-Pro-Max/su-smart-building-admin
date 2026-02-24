import React from "react";
import { Button, Form, Input, message } from "antd";
import Logo from "../../../assets/images/login/logo2.png";
import KeySvg from "../../../assets/images/login/key.svg";
import { UserOutlined } from "@ant-design/icons";
import { loginService } from "../../../services/auth";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";

function LoginForm() {
  const navigate = useNavigate();
  const handleLogin = async (values) => {
    try {
      const data = await loginService(values.username, values.password);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/booking/";
    } catch (err) {
      const errorMsg = err.response?.data?.message || "การเชื่อมต่อผิดพลาด";
      notification.error({
        description: errorMsg,
      });
    }
  };
  return (
    <div className="w-full h-full max-w-[550px] bg-white flex flex-col p-6 gap-5 items-center justify-center">
      <img src={Logo} className="w-50 item" />
      <div>
        <h1 className="font-extrabold text-xl">ระบบจองห้องประชุม</h1>
        <p>คณะวิทยาศาสตร์ มหาวิทยาลัยศิลปากร</p>
      </div>
      <Form
        layout="vertical"
        initialValues={{ remember: true }}
        onFinish={handleLogin}
        autoComplete="off"
        className="w-full max-w-[400px]"
      >
        <Form.Item
          label="username"
          name="username"
          rules={[{ required: true, message: "กรุณาระบุ Username" }]}
        >
          <Input prefix={<UserOutlined style={{ color: "#D9D9D9" }} />} />
        </Form.Item>
        <Form.Item
          label="password"
          name="password"
          rules={[{ required: true, message: "กรุณาระบุ Password" }]}
        >
          <Input.Password prefix={<KeyIcon />} />
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" block htmlType="submit" shape="round">
            เข้าสู่ระบบ
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default LoginForm;

function KeyIcon() {
  return <img src={KeySvg} />;
}
