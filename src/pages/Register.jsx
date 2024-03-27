import { Button, Input, Radio, notification } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import instance from "../api/apiConfig";

export default function Register() {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    UserName: "",
    DateOfBirth: "",
    PhoneNumber: "",
    Password: "",
  });
  const [gender, setGender] = useState(0);

  const handleChange = (e) => {
    const { value, name } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleChecked = (e) => {
    setGender(e.target.value);
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const newUser = {
        ...user,
        Gender: gender,
        Image:
          "https://t4.ftcdn.net/jpg/05/49/98/39/360_F_549983970_bRCkYfk0P6PP5fKbMhZMIb07mCJ6esXL.jpg",
      };

      // Call API
      const res = await instance.post("/auth/register", newUser);
      if (res.data.status === 201) {
        navigate("/login");
        notification.success({
          message: "Thành công",
          description: res.data.message,
        });
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
          className="bg-white p-7 rounded shadow-md w-96 border flex flex-col gap-2"
        >
          <h3 className="font-bold text-2xl text-center my-3">
            Đăng ký tài khoản
          </h3>
          <div>
            <label htmlFor="name">Tên</label>
            <Input
              onChange={handleChange}
              value={user.UserName}
              name="UserName"
              className="mt-1"
              id="name"
              placeholder="Nhập họ và tên"
            />
          </div>
          <div className="mt-1">
            <label htmlFor="gender">Giới tính</label>
            <div>
              <Radio.Group onChange={handleChecked} value={gender}>
                <Radio value={0}>Nam</Radio>
                <Radio value={1}>Nữ</Radio>
                <Radio value={2}>Khác</Radio>
              </Radio.Group>
            </div>
          </div>
          <div>
            <label htmlFor="date">Ngày sinh</label>
            <Input
              onChange={handleChange}
              value={user.DateOfBirth}
              name="DateOfBirth"
              className="mt-1"
              id="date"
              type="date"
            />
          </div>
          <div>
            <label htmlFor="phoneNumber">Số điện thoại</label>
            <Input
              onChange={handleChange}
              value={user.PhoneNumber}
              name="PhoneNumber"
              className="mt-1"
              id="phoneNumber"
              placeholder="Nhập số điện thoại"
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
            />
          </div>
          <div className="mt-2">
            <Button
              htmlType="submit"
              className="bg-blue-600 w-full"
              type="primary"
            >
              Đăng ký
            </Button>
          </div>
          <p className="text-center ">
            Bạn đã có tài khoản?{" "}
            <Link className="text-blue-600  " to="/login">
              Đăng nhập
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
