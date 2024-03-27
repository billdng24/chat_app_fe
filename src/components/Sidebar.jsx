import { useEffect, useState } from "react";
import {
  LogoutOutlined,
  MessageOutlined,
  SettingFilled,
  SettingOutlined,
  SolutionOutlined,
  UserOutlined,
} from "@ant-design/icons";
import Modal from "./modals/Modal";
import Popup_Infor_User from "./modals/Popup_Infor_User";
import { NavLink, useNavigate } from "react-router-dom";
import { notification } from "antd";
import instance from "../api/apiConfig";
import { useAuthContext } from "../context/AuthContext";

export default function Sidebar() {
  const { userLocal, setUserLocal } = useAuthContext();
  const [showOption, setShowOption] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  // Mở modal xác nhận đăng xuất
  const handleShowModal = () => {
    setShowModal(true);
    setShowOption(false);
  };

  // Đóng modal xác nhận đăng xuất
  const closeModal = () => {
    setShowModal(false);
  };

  // Xác nhận đăng nhập
  const handleLogout = async () => {
    try {
      const res = await instance.post("/auth/logout");
      if (res.data.status === 200) {
        notification.success({
          message: "Thành công",
          description: res.data.message,
        });
        setShowModal(false);
        localStorage.removeItem("userLocal");
        setUserLocal(null);
        navigate("/login");
      } else {
        notification.error({
          message: "Thất bại",
          description: "Lỗi hệ thống, vui lòng thử lại sau !!!",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Danh sách yêu cầu kết bạn
  const listFriendRequest = async () => {
    try {
      const res = await instance.get(
        `friends/list-requests/${userLocal.UserId}`
      );
      setCount(res.data.data.length);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    listFriendRequest();
  }, []);

  // Mở popup thông tin tài khoản
  const handleShowPopup = () => {
    setShowPopup(true);
    setShowOption(false);
  };
  // Đóng popup thông tin tài khoản
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      {/* Modal xác nhận đăng xuất */}
      {showModal && <Modal close={closeModal} handleOk={handleLogout} />}

      {/* Popup hiển thị thông tin cá nhân */}
      {showPopup && <Popup_Infor_User close={handleClosePopup} />}

      <div className="w-20 bg-sky-500 h-screen justify-between flex gap-5 flex-col items-center ">
        <div className="flex flex-col items-center mt-3">
          <img
            title={userLocal.UserName}
            className="h-12 w-12 border rounded-full mt-2 mb-3"
            src={userLocal.Image}
            alt=""
          />
          <NavLink
            title="Tin nhắn"
            to="/"
            className="relative p-6 cursor-pointer"
            style={({ isActive }) => {
              return {
                backgroundColor: isActive ? "rgb(2 132 199)" : "",
              };
            }}
          >
            <span className="lex items-center justify-center absolute bg-red-500 rounded-full text-white text-xs right-1 top-2 z-10"></span>
            <MessageOutlined className="text-3xl text-white" />
          </NavLink>
          <NavLink
            title="Danh bạ"
            to="/list-request"
            className="relative p-6 cursor-pointer"
            style={({ isActive }) => {
              return {
                backgroundColor: isActive ? "rgb(2 132 199)" : "",
              };
            }}
          >
            <span
              className={`flex items-center justify-center absolute bg-red-500 rounded-full text-white text-xs right-2 top-3 z-10 ${
                count > 0 ? "w-4 h-4" : ""
              }`}
            >
              {count > 0 ? `${count}` : ""}
            </span>
            <SolutionOutlined className="text-3xl text-white" />
          </NavLink>
        </div>

        <div>
          {showOption && (
            <ul className="relative w-56 border shadow-2xl bg-white bottom-0 z-10 left-20 flex flex-col rounded-sm">
              <li
                onClick={handleShowPopup}
                className="flex gap-2 py-2 items-center hover:bg-slate-300 cursor-pointer"
              >
                <UserOutlined className="ml-2" />
                Thông tin tài khoản
              </li>
              <li className="flex gap-2 py-2 items-center hover:bg-slate-300 cursor-pointer">
                <SettingOutlined className="ml-2" />
                Cài đặt
              </li>
              <li
                onClick={handleShowModal}
                className="flex gap-2 py-2 items-center hover:bg-slate-300 cursor-pointer after:content-[''] after:bg-slate-300 after:bottom-10 after:left-1/2 after:-translate-x-1/2 after:h-[1px] after:w-52 after:text-center after:absolute"
              >
                <LogoutOutlined className="ml-2" />
                Đăng xuất
              </li>
            </ul>
          )}
          <div onClick={() => setShowOption(!showOption)}>
            {showOption ? (
              <SettingFilled
                title="Cài đặt"
                className={`${
                  showOption ? "left-[74px]" : "left-[1px]"
                } text-3xl relative text-white px-6 py-4 hover:bg-sky-600 cursor-pointer`}
              />
            ) : (
              <SettingOutlined
                title="Cài đặt"
                className={`${
                  showOption ? "left-[74px]" : "left-[1px]"
                } text-3xl relative text-white px-6 py-4 hover:bg-sky-600 cursor-pointer`}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
