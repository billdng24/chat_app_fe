import { CloseOutlined } from "@ant-design/icons";
import { DatePicker, Input, Radio, notification } from "antd";
import PropTypes from "prop-types";
import moment from "moment";
import { useState } from "react";
import instance from "../api/apiConfig";

export default function Popup_Update_User({ close, userLocal }) {
  const [newUserName, setNewUserName] = useState(userLocal.UserName);
  const [newGender, setNewGender] = useState(userLocal.Gender);
  const [newDateOfBirth, setNewDateOfBirth] = useState(userLocal.DateOfBirth);
  const [newImage, setNewImage] = useState(userLocal.Image);
  const [file, setFile] = useState(null);

  const handleChangeImage = (e) => {
    setFile(e.target.files[0]);
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setNewImage(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateUser = async () => {
    try {
      const formData = new FormData();
      formData.append("UserName", newUserName);
      formData.append("Gender", newGender);
      formData.append(
        "DateOfBirth",
        newDateOfBirth
          ? moment(newDateOfBirth, "YYYY-MM-DD").format("YYYY-MM-DD")
          : null
      );
      formData.append("ModifiedDate", Date());
      if (file) {
        formData.append("image", file); // Đảm bảo tên trường phù hợp với backend
      }
      const res = await instance.put(`/users/${userLocal.UserId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log(res);
      if (res.data.status === 201) {
        close();
        const updatedUserLocal = {
          ...userLocal,
          UserName: newUserName,
          Gender: newGender,
          DateOfBirth: newDateOfBirth,
          Image: res.data.file,
          ModifiedDate: Date(),
        };
        localStorage.setItem("userLocal", JSON.stringify(updatedUserLocal));

        notification.success({
          message: "Thành công",
          description: res.data.message,
        });
      } else if (res.data.status === 500) {
        notification.error({
          message: "Thất bại",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <div className="z-50 fixed top-0 bottom-0 right-0 left-0 flex justify-center items-center">
        <div className="bg-white p-6 px-2 rounded w-[450px]">
          <div className="flex justify-between items-center ">
            <h3 className="font-semibold text-xl">Cập nhật thông tin</h3>
            <CloseOutlined onClick={close} className="cursor-pointer" />
          </div>
          <div className="relative py-4 flex-col flex items-center gap-8 mb-14">
            <img
              className="h-[200px] w-full object-cover relative"
              src={newImage}
              alt=""
            />
            <div className="absolute bottom-[-37px]">
              <label htmlFor="avatar">
                <img
                  className="h-28 w-28 rounded-full cursor-pointer"
                  src={newImage}
                  alt=""
                />
              </label>
              <input
                id="avatar"
                type="file"
                hidden
                onChange={(e) => handleChangeImage(e)}
              />
            </div>
          </div>
          <form className="flex flex-col gap-3 px-5">
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="font-semibold">
                Họ và tên
              </label>
              <Input
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                className="h-9"
                id="name"
                placeholder="Nhập họ và tên"
              />
            </div>
            <div className="border"></div>
            <h3 className="text-lg font-semibold">Thông tin cá nhân</h3>
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="font-semibold">
                Giới tính
              </label>
              <Radio.Group
                value={newGender}
                onChange={(e) => setNewGender(e.target.value)}
              >
                <Radio value={0}>Nam</Radio>
                <Radio value={1}>Nữ</Radio>
              </Radio.Group>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="name" className="font-semibold">
                Ngày sinh
              </label>
              <DatePicker
                format="YYYY-MM-DD"
                value={moment(newDateOfBirth, "YYYY-MM-DD")}
                onChange={(date, dateString) => setNewDateOfBirth(dateString)}
                placeholder="Chọn ngày sinh"
              />
            </div>
          </form>
          {/* Infor start */}

          {/* Infor end */}
          <div className="border my-4"></div>
          <div className="flex justify-end items-center gap-2">
            <button className="flex justify-center items-center gap-2 border h-9 px-4 rounded hover:bg-slate-200">
              Hủy
            </button>
            <button
              onClick={handleUpdateUser}
              className=" bg-blue-600 text-white hover:bg-blue-400 flex justify-center items-center gap-2 border h-9 px-4 rounded"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

Popup_Update_User.propTypes = {
  userLocal: PropTypes.shape({
    UserId: PropTypes.number,
    Image: PropTypes.string,
    UserName: PropTypes.string,
    Gender: PropTypes.number,
    DateOfBirth: PropTypes.string,
  }),
  close: PropTypes.func.isRequired,
};
