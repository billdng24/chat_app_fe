import { useEffect, useState } from "react";
import {
  LogoutOutlined,
  MessageOutlined,
  SettingOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import Modal from "./Modal";
import Popup_Infor_User from "./Popup_Infor_User";
import { Link, useNavigate } from "react-router-dom";
import { notification } from "antd";
import instance from "../api/apiConfig";

export default function Sidebar() {
  const userLocal = JSON.parse(localStorage.getItem("userLocal"));
  const [showOption, setShowOption] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [countFriends, setCountFriends] = useState(0);
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
  const handleLogout = () => {
    setShowModal(false);
    localStorage.removeItem("userLocal");
    navigate("/login");
  };

  // Mở popup thông tin tài khoản
  const handleShowPopup = () => {
    setShowPopup(true);
    setShowOption(false);
  };
  // Đóng popup thông tin tài khoản
  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const listFriendSuggest = async () => {
    try {
      const res = await instance.get(
        `friends/list-friend-suggest/${userLocal.UserId}`
      );
        setCountFriends(res.data.data.length);
    } catch (error) {
      if (error.response.data.status === 500) {
        notification.error({
          message: "Lỗi",
          description: "Hệ thống đang bị lỗi, vui lòng thử lại sau.",
        });
      }
    }
  };

  useEffect(() => {
    listFriendSuggest();
  }, []);

  return (
    <>
      {/* Modal xác nhận đăng xuất */}
      {showModal && <Modal close={closeModal} handleOk={handleLogout} />}

      {/* Popup hiển thị thông tin cá nhân */}
      {showPopup && <Popup_Infor_User close={handleClosePopup} />}

      <div className="w-20 bg-blue-600 h-screen justify-between flex gap-5 flex-col items-center ">
        <div className="flex flex-col items-center gap-4 mt-8">
          <img
            className="h-12 w-12 border rounded-full p-1"
            src="https://docs.nestjs.com/assets/logo-small.svg"
            alt=""
          />
          <Link to="/chat" className="relative  p-6 cursor-pointer">
            <span className="absolute bg-red-500 rounded-xl text-white text-sm right-0 z-10">
              10+
            </span>
            <MessageOutlined className="text-3xl text-white " />
          </Link>
          <Link to="/list-request" className="relative  p-6 cursor-pointer">
            <span className="absolute bg-red-500 rounded-xl text-white text-sm right-0 z-10">
              {countFriends}+
            </span>
            <UsergroupAddOutlined className="text-3xl text-white " />
          </Link>
        </div>

        <div>
          {showOption && (
            <ul className="relative w-56 border shadow-xl bg-white bottom-0 z-10 left-24 flex flex-col">
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
                className="flex gap-2 py-2 items-center hover:bg-slate-300 cursor-pointer"
              >
                <LogoutOutlined className="ml-2" />
                Đăng xuất
              </li>
            </ul>
          )}
          <div onClick={() => setShowOption(!showOption)}>
            <SettingOutlined
              className={`${
                showOption ? "left-[74px]" : "left-[1px]"
              } text-3xl relative text-white px-6 py-4 hover:bg-blue-400 cursor-pointer`}
            />
          </div>
        </div>
      </div>
    </>
  );
}
