import { Button, Input, notification } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../api/apiConfig";
import { useAuthContext } from "../context/AuthContext";

export default function Login() {
  const { setUserLocal } = useAuthContext();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    PhoneNumber: "",
    Password: "",
  });

  const handleChange = (e) => {
    const { value, name } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const res = await instance.post("auth/login", user);
      if (res.data.status === 200) {
        localStorage.setItem("userLocal", JSON.stringify(res.data.data));
        setUserLocal(res.data.data);
        notification.success({
          message: "Thành công",
          description: res.data.message,
        });
        navigate("/");
      }
    } catch (error) {
      if (error.response.data.status === 400) {
        notification.error({
          message: "Lỗi",
          description: error.response.data.message,
        });
      } else {
        notification.error({
          message: "Lỗi",
          description: "Lỗi hệ thống.",
        });
      }
    }
  };
  return (
    <>
      <div className="flex justify-center items-center min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="bg-white h-[350px] p-7 rounded shadow-md w-96 border flex flex-col gap-3"
        >
          <h3 className="font-bold text-2xl text-center my-3">Đăng nhập</h3>
          <div>
            <label htmlFor="phoneNumber">Số điện thoại</label>
            <Input
              onChange={handleChange}
              value={user.PhoneNumber}
              name="PhoneNumber"
              className="mt-1"
              id="phoneNumber"
              placeholder="Nhập số điện thoại"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="password">Mật khẩu</label>
            <Input.Password
              onChange={handleChange}
              value={user.Password}
              name="Password"
              className="mt-1"
              id="password"
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
          </div>

          <div className="mt-2">
            <Button
              htmlType="submit"
              className="bg-blue-600 w-full"
              type="primary"
            >
              Đăng nhập
            </Button>
          </div>
          <p className="text-center ">
            Bạn đã có tài khoản?{" "}
            <Link className="text-blue-600  " to="/register">
              Đăng ký
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
