import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Modal, notification, Spin } from "antd";
import {
  DownOutlined,
  EllipsisOutlined,
  FilterOutlined,
  LeftOutlined,
  MailOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";

import Sidebar from "../components/Sidebar";
import instance from "../api/apiConfig";
import { useAuthContext } from "../context/AuthContext";
import Search from "../components/Search";
import { io } from "socket.io-client";

export default function List() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const { userLocal } = useAuthContext();
  const [socket, setSocket] = useState(null);
  const [showRoomChat, setShowRoomChat] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [count, setCount] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [hidden, setHidden] = useState(false);

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setRoomName("");
    setIsModalOpen(false);
  };

  // Tạo phòng
  const handleAddRoom = async () => {
    try {
      const res = await instance.post("rooms", {
        RoomName: roomName,
        CreatedByUserId: userLocal.UserId,
      });
      setRoomName("");
      setIsModalOpen(false);
      navigate("/chat");
      if (res.data.status === 201) {
        notification.success({
          message: "Thành công",
          description: res.data.message,
        });
      }
    } catch (error) {
      if (error.response.data.status === 400) {
        setError(error.response.data.message);
      }
    }
  };

  // Danh sách gợi ý kết bạn
  const listFriendSuggest = async () => {
    try {
      const res = await instance.get(
        `friends/list-friend-suggest/${userLocal.UserId}`
      );
      setFriends(res.data.data);
    } catch (error) {
      if (error.response.data.status === 500) {
        notification.error({
          message: "Lỗi",
          description: "Hệ thống đang bị lỗi, vui lòng thử lại sau.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (socket === null) return;

    socket.on("getRequest", () => {
      listFriendRequest();
    });

    return () => {
      socket.off("getRequest");
    };
  }, [socket]);

  // Lấy ra danh sach yêu cầu kết bạn
  const listFriendRequest = async () => {
    try {
      const res = await instance.get(
        `friends/list-requests/${userLocal.UserId}`
      );
      setRequests(res.data.data);
      setCount(res.data.data.length);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (socket === null) return;

    socket.on("getRequest", () => {
      listFriendSuggest();
    });
  }, [socket]);

  // Danh sách bạn bè
  const listFriend = async () => {
    try {
      const res = await instance.get(
        `friends/list-friended/${userLocal.UserId}`
      );
      setFriends(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    listFriendSuggest();
    listFriendRequest();
    listFriend();
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleShowRequest = () => {
    setShowRequest(true);
    setShowRoomChat(false);
    setHidden(true);
  };

  const handleShowRoomChat = () => {
    setShowRoomChat(true);
    setShowRequest(false);
    setHidden(true);
  };

  const handleShowFriend = () => {
    listFriend();
    setShowRequest(false);
    setShowRoomChat(false);
    setHidden(true);
  };

  // Xử lý chấp nhận lời mời kết bạn
  const handleConfirmRequest = async (id, userId) => {
    try {
      const res = await instance.put(`friends/update-status-request/${id}`);
      await instance.post("friends/confirm-friend", {
        UserId1: userLocal.UserId,
        UserId2: userId,
      });
      await instance.delete(`friends/delete-request/${id}`);
      listFriendRequest();
      notification.success({
        message: "Thành công",
        description: res.data.message,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Hủy yêu cầu kết bạn
  const handleDeleteRequest = async (id) => {
    try {
      const res = await instance.delete(`friends/${id}`);
      listFriendRequest();
      if (res.data.status === 200) {
        notification.success({
          message: "Thành công.",
          description: res.data.message,
        });
        socket.emit("deleteRequest", {});
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const listRoomChat = async () => {
    try {
      const res = await instance.get(`rooms/list-room/${userLocal.UserId}`);
      setRooms(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    listRoomChat();
  }, []);

  const handleClose = () => {
    setHidden(false);
  };

  return (
    <>
      {/* Modal tạo phòng */}
      <Modal
        title="Tạo phòng"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={false}
      >
        <Input
          status={error ? "error" : ""}
          onChange={(e) => setRoomName(e.target.value)}
          value={roomName}
          placeholder="Nhập tên phòng..."
        />
        <p className="mt-1 text-red-500">
          {roomName === "" ? "Tên phòng không được để trống" : ""}
          {error}
        </p>
        <div className="flex justify-end gap-3 mt-3 p-0">
          <Button onClick={handleCancel}>Hủy</Button>
          <Button
            onClick={handleAddRoom}
            className="bg-blue-600"
            type="primary"
          >
            Tạo
          </Button>
        </div>
      </Modal>

      <div className="flex">
        <Sidebar />
        <div
          className={`${
            hidden ? "hidden pc:block" : ""
          } flex-col w-full pc:w-80 border-r`}
        >
          <Search />
          <ul className="flex flex-col">
            <li
              className={`flex items-center font-semibold text-gray-700 p-3 cursor-pointer gap-3 ${
                showRoomChat || showRequest ? "bg-white" : "bg-[#E9F2FD]"
              }`}
              onClick={handleShowFriend}
            >
              <UnorderedListOutlined />
              <h3>Danh sách bạn bè</h3>
            </li>
            <li
              className={`flex items-center font-semibold text-gray-700 p-3 cursor-pointer gap-3 ${
                showRoomChat && !showRequest ? "bg-[#E9F2FD]" : ""
              }`}
              onClick={handleShowRoomChat}
            >
              <UnorderedListOutlined />
              <h3>Danh sách nhóm</h3>
            </li>
            <li
              className={`flex items-center font-semibold text-gray-700 p-3 cursor-pointer gap-3 ${
                showRequest && !showRoomChat ? "bg-[#E9F2FD]" : ""
              }`}
              onClick={handleShowRequest}
            >
              <MailOutlined />
              <h3 className="relative">
                Lời mời kết bạn
                <span
                  className={`flex text-xs items-center justify-center absolute bg-red-500 rounded-full text-white -right-4 -top-1 z-10 ${
                    count > 0 ? "w-4 h-4" : ""
                  }`}
                >
                  {count > 0 ? `${count}` : ""}
                </span>
              </h3>
            </li>
          </ul>
        </div>
        <div
          className={`${
            hidden ? "block" : "hidden pc:block"
          } w-full h-screen bg-gray-100`}
        >
          {showRequest ? (
            <>
              <h3 className="flex items-center gap-4 px-5 py-3 bg-white border-b border-gray-300 font-semibold text-gray-700">
                <LeftOutlined
                  onClick={handleClose}
                  className="pc:hidden block text-sm sm_tablet:text-base pb-[2px] hover:bg-slate-400 hover:rounded-full w-[1.4rem] h-[1.4rem]"
                />
                <MailOutlined className="text-sm sm_tablet:text-base" />
                <h3 className="text-sm sm_tablet:text-base">Lời mời kết bạn</h3>
              </h3>
              <hr />
              <div className="flex justify-center sm_tablet:justify-start flex-wrap gap-4 p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Spin />
                  </div>
                ) : (
                  requests.map((request, index) => (
                    <div key={index} className="bg-white rounded-md p-2 w-72">
                      <div className="flex gap-2 items-center mb-3">
                        <img
                          className="sm_tablet:h-14 sm_tablet:w-14 h-10 w-10 rounded-full"
                          src={request.Image}
                          alt=""
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold">{}</span>
                          <span className="text-sm">{request.UserName}</span>
                        </div>
                      </div>
                      <div className="border px-3 py-4 mb-3 text-sm sm_tablet:text-base">
                        Xin chào bạn, mình là {request.UserName}. Kết bạn nha
                      </div>
                      <div className="flex justify-between gap-2">
                        <button
                          onClick={() => handleDeleteRequest(request.RequestId)}
                          className="h-10 flex-1 font-semibold bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() =>
                            handleConfirmRequest(
                              request.RequestId,
                              request.UserId
                            )
                          }
                          className="bg-sky-100 rounded-md text-blue-600 font-semibold hover:bg-blue-200 h-10 flex-1 "
                        >
                          Đồng ý
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : showRoomChat ? (
            <>
              <h3 className="flex items-center gap-4 px-5 py-3 bg-white border-b border-gray-300 font-semibold text-gray-700">
                <LeftOutlined
                  onClick={handleClose}
                  className="pc:hidden block text-sm sm_tablet:text-base pb-[2px] hover:bg-slate-400 hover:rounded-full w-[1.4rem] h-[1.4rem]"
                />
                <UnorderedListOutlined className="text-sm sm_tablet:text-base" />
                <span className="text-sm sm_tablet:text-base">
                  Danh sách nhóm
                </span>
              </h3>
              <hr />
              <div className="py-2 pc:py-6 px-3">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Spin />
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-gray-700 text-sm font-semibold">
                        Nhóm ({rooms.length})
                      </span>
                      <div className="bg-white h-28 sm_tablet:h-14 pc:h-full rounded-t-lg p-4 mt-3 pc:mt-6">
                        <div className="flex sm_mobile:flex-wrap sm_tablet:flex-nowrap justify-between gap-1 sm_tablet:gap-2 h-8">
                          <div className="pc:flex-1 flex items-center justify-start border rounded-md p-1 sm_tablet:py-2 sm_tablet:px-3 w-full sm_tablet:w-auto">
                            <SearchOutlined className="text-gray-400 text-base sm_tablet:text-lg mr-2" />
                            <input
                              type="text"
                              placeholder="Tìm bạn"
                              className="outline-none flex-1 text-sm sm_tablet:w-24 tablet:w-40"
                            />
                          </div>
                          <div className="sm_mobile:flex-1 flex bg-gray-100 rounded-md w-full justify-between p-2 pc:p-2 mt-3 sm_tablet:m-0 items-center transition-all hover:bg-gray-200">
                            <div className="flex items-center justify-start">
                              <SortAscendingOutlined className="text-gray-700 text-sm sm_tablet:text-xl mr-2" />
                              <input
                                type="text"
                                className="outline-none text-xs sm_tablet:text-sm text-gray-700 font-medium hover:bg-gray-200 transition-all sm_mobile:w-16 sm_tablet:w-20 tablet:w-32 pc:w-full truncate"
                                value="Hoạt động (mới -> cũ)"
                                disabled
                              />
                            </div>
                            <DownOutlined className="text-gray-700 text-sm sm_tablet:text-xl mr-2" />
                          </div>
                          <div className="sm_mobile:flex-1 flex bg-gray-100 rounded-md w-full justify-between p-2 pc:p-2 mt-3 sm_tablet:m-0 items-center hover:bg-gray-200">
                            <div className="flex items-center justify-start">
                              <FilterOutlined className="text-gray-700 text-sm sm_tablet:text-xl mr-2" />
                              <input
                                type="text"
                                className="outline-none text-xs sm_tablet text-gray-700 font-medium hover:bg-gray-200 w-[65px]"
                                value="Tất cả"
                                disabled
                              />
                            </div>
                            <DownOutlined className="text-gray-700 text-sm sm_tablet:text-xl mr-2" />
                          </div>
                        </div>
                        <div></div>
                      </div>
                      <ul className="bg-white h-full w-full">
                        {rooms.map((room, index) => (
                          <>
                            <li
                              key={index}
                              className="flex items-center hover:bg-gray-100 px-3 py-1 cursor-pointer"
                            >
                              <img
                                src={room.Image}
                                alt=""
                                className="h-10 w-10 sm_tablet:h-12 sm_tablet:w-12 border rounded-full"
                              />
                              <div className="flex flex-1 justify-between items-center p-2 relative">
                                <div className="before:content-[''] before:h-[1px] before:w-full before:-bottom-1 before:left-0 before:absolute before:bg-slate-300">
                                  <h3 className="font-semibold text-gray-800">
                                    {room.RoomName}
                                  </h3>
                                  <span className="font-normal text-gray-600 text-sm sm_tablet:text-base">
                                    4 thành viên
                                  </span>
                                </div>
                                <EllipsisOutlined className="p-2 hover:bg-gray-200 rounded" />
                              </div>
                            </li>
                          </>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h3 className="flex items-center gap-4 px-5 py-3 bg-white border-b border-gray-300 font-semibold text-gray-700">
                <LeftOutlined
                  onClick={handleClose}
                  className="pc:hidden block text-sm sm_tablet:text-base pb-[2px] hover:bg-slate-400 hover:rounded-full w-[1.4rem] h-[1.4rem]"
                />
                <UnorderedListOutlined className="text-sm sm_tablet:text-base" />
                <span className="text-sm sm_tablet:text-base">
                  Danh sách bạn bè
                </span>
              </h3>
              <hr />
              <div className="py-2 pc:py-6 px-3">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Spin />
                  </div>
                ) : (
                  <>
                    <div>
                      <span className="text-gray-700 text-sm font-semibold">
                        Bạn bè ({friends.length})
                      </span>
                      <div className="bg-white h-28 sm_tablet:h-14 pc:h-full rounded-t-lg p-4 mt-3 pc:mt-6">
                        <div className="flex sm_mobile:flex-wrap sm_tablet:flex-nowrap justify-between gap-1 sm_tablet:gap-2 h-8">
                          <div className="pc:flex-1 flex items-center justify-start border rounded-md p-1 sm_tablet:py-2 sm_tablet:px-3 w-full sm_tablet:w-auto">
                            <SearchOutlined className="text-gray-400 text-base sm_tablet:text-lg mr-2" />
                            <input
                              type="text"
                              placeholder="Tìm bạn"
                              className="outline-none flex-1 text-sm sm_tablet:w-24 tablet:w-40"
                            />
                          </div>
                          <div className="sm_mobile:flex-1 flex bg-gray-100 rounded-md w-full justify-between p-2 pc:p-2 mt-3 sm_tablet:m-0 items-center transition-all hover:bg-gray-200">
                            <div className="flex items-center justify-start">
                              <SortAscendingOutlined className="text-gray-700 text-sm sm_tablet:text-xl mr-2" />
                              <input
                                type="text"
                                className="outline-none text-xs sm_tablet:text-sm text-gray-700 font-medium hover:bg-gray-200 transition-all sm_mobile:w-16 sm_tablet:w-20 tablet:w-32 pc:w-full truncate"
                                value="Tên (A-Z)"
                                disabled
                              />
                            </div>
                            <DownOutlined className="text-gray-700 text-sm sm_tablet:text-xl mr-2" />
                          </div>
                          <div className="sm_mobile:flex-1 flex bg-gray-100 rounded-md w-full justify-between p-2 pc:p-2 mt-3 sm_tablet:m-0 items-center hover:bg-gray-200">
                            <div className="flex items-center justify-start">
                              <FilterOutlined className="text-gray-700 text-sm sm_tablet:text-xl mr-2" />
                              <input
                                type="text"
                                className="outline-none text-xs sm_tablet text-gray-700 font-medium hover:bg-gray-200 w-[65px]"
                                value="Tất cả"
                                disabled
                              />
                            </div>
                            <DownOutlined className="text-gray-700 text-sm sm_tablet:text-xl mr-2" />
                          </div>
                        </div>
                        <div></div>
                      </div>
                      <ul className="bg-white h-full w-full">
                        {friends.map((friend, index) => (
                          <>
                            <li
                              key={index}
                              className="flex items-center hover:bg-gray-100 px-3 py-2 cursor-pointer"
                            >
                              <img
                                src={friend.Image}
                                alt={friend.UserName}
                                className="h-10 w-10 sm_tablet:h-12 sm_tablet:w-12 border rounded-full"
                              />
                              <div className="flex flex-1 justify-between items-center p-2 relative">
                                <div className="before:content-[''] before:h-[1px] before:w-full before:-bottom-2 before:left-0 before:absolute before:bg-slate-300">
                                  <h3 className="font-semibold text-gray-800 text-sm sm_tablet:text-base">
                                    {friend.UserName}
                                  </h3>
                                </div>
                                <EllipsisOutlined className="p-2 hover:bg-gray-200 rounded" />
                              </div>
                            </li>
                          </>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
