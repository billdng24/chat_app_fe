import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Modal, notification, Spin } from "antd";
import {
  DownOutlined,
  EllipsisOutlined,
  FilterOutlined,
  MailOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { io } from "socket.io-client";

import Sidebar from "../components/Sidebar";
import instance from "../api/apiConfig";
import { useAuthContext } from "../context/AuthContext";
import Search from "../components/Search";

export default function List_Request() {
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
  };

  const handleShowRoomChat = () => {
    setShowRoomChat(true);
    setShowRequest(false);
  };

  const handleShowFriend = () => {
    listFriend();
    setShowRequest(false);
    setShowRoomChat(false);
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
        <div className="flex flex-col w-80 border-r">
          <Search />
          <ul className="flex flex-col h-full">
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
        <div className="w-full h-screen bg-gray-100">
          {showRequest ? (
            <>
              <h3 className="flex items-center gap-4 px-5 py-3 bg-white border-b border-gray-300 font-semibold text-gray-700">
                <MailOutlined />
                <h3>Lời mời kết bạn</h3>
              </h3>
              <hr />
              <div className="flex flex-wrap gap-4 p-8">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Spin />
                  </div>
                ) : (
                  requests.map((request, index) => (
                    <div key={index} className="bg-white rounded-md p-2 w-80">
                      <div className="flex gap-2 items-center mb-3">
                        <img
                          className="h-14 w-14 rounded-full"
                          src={request.Image}
                          alt=""
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold">{}</span>
                          <span className="text-sm">{request.UserName}</span>
                        </div>
                      </div>
                      <div className="border px-3 py-4 mb-3">
                        Xin chào bạn, mình là {request.UserName}. Kết bạn nha
                      </div>
                      <div className="flex justify-center gap-3">
                        <Button
                          onClick={() => handleDeleteRequest(request.RequestId)}
                        >
                          Từ chối
                        </Button>
                        <Button
                          onClick={() =>
                            handleConfirmRequest(
                              request.RequestId,
                              request.UserId
                            )
                          }
                          className="bg-blue-600"
                          type="primary"
                        >
                          Đồng ý
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : showRoomChat ? (
            <>
              <h3 className="flex items-center gap-4 px-5 py-3 bg-white border-b border-gray-300 font-semibold text-gray-700">
                <UnorderedListOutlined />
                <span>Danh sách nhóm</span>
              </h3>
              <hr />
              <div className="py-6 px-3">
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
                      <div className="bg-white h-full w-full rounded-t-lg p-4 mt-6">
                        <div className="flex justify-between gap-4 h-8">
                          <div className="flex items-center justify-start border rounded-md py-2 px-3 w-full">
                            <SearchOutlined className="text-gray-400 text-lg mr-2" />
                            <input
                              type="text"
                              placeholder="Tìm kiếm ..."
                              className="outline-none flex-1 text-sm"
                            />
                          </div>
                          <div className="flex bg-gray-100 rounded-md w-full justify-between px-2 items-center transition-all hover:bg-gray-200">
                            <div className="flex items-center justify-start">
                              <SortAscendingOutlined className="text-gray-700 text-xl mr-2" />
                              <input
                                type="text"
                                className="outline-none flex-1 text-sm text-gray-700 font-medium hover:bg-gray-200 transition-all"
                                value="Hoạt động (mới ➝ cũ)"
                                disabled
                              />
                            </div>
                            <DownOutlined className="text-gray-700 text-xl mr-2" />
                          </div>
                          <div className="flex bg-gray-100 rounded-md w-full justify-between px-2 items-center hover:bg-gray-200">
                            <div className="flex items-center justify-start">
                              <FilterOutlined className="text-gray-700 text-xl mr-2" />
                              <input
                                type="text"
                                placeholder="Tìm bạn"
                                className="outline-none flex-1 text-sm text-gray-700 font-medium hover:bg-gray-200"
                                value="Tất cả"
                                disabled
                              />
                            </div>
                            <DownOutlined className="text-gray-700 text-xl mr-2" />
                          </div>
                        </div>
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
                                className="h-12 w-12 border rounded-full"
                              />
                              <div className="flex flex-1 justify-between items-center p-2 relative">
                                <div className="before:content-[''] before:h-[1px] before:w-full before:-bottom-1 before:left-0 before:absolute before:bg-slate-300">
                                  <h3 className="font-semibold text-gray-800">
                                    {room.RoomName}
                                  </h3>
                                  <span className="font-normal text-gray-600">
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
                <UnorderedListOutlined />
                <span>Danh sách bạn bè</span>
              </h3>
              <hr />
              <div className="py-6 px-3">
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
                      <div className="bg-white h-full w-full rounded-lg p-4 mt-6">
                        <div className="flex justify-between gap-4 h-8">
                          <div className="flex items-center justify-start border rounded-md py-2 px-3 w-full">
                            <SearchOutlined className="text-gray-400 text-lg mr-2" />
                            <input
                              type="text"
                              placeholder="Tìm bạn"
                              className="outline-none flex-1 text-sm"
                            />
                          </div>
                          <div className="flex bg-gray-100 rounded-md w-full justify-between px-2 items-center transition-all hover:bg-gray-200">
                            <div className="flex items-center justify-start">
                              <SortAscendingOutlined className="text-gray-700 text-xl mr-2" />
                              <input
                                type="text"
                                placeholder="Tìm bạn"
                                className="outline-none flex-1 text-sm text-gray-700 font-medium hover:bg-gray-200 transition-all"
                                value="Tên (A-Z)"
                                disabled
                              />
                            </div>
                            <DownOutlined className="text-gray-700 text-xl mr-2" />
                          </div>
                          <div className="flex bg-gray-100 rounded-md w-full justify-between px-2 items-center hover:bg-gray-200">
                            <div className="flex items-center justify-start">
                              <FilterOutlined className="text-gray-700 text-xl mr-2" />
                              <input
                                type="text"
                                placeholder="Tìm bạn"
                                className="outline-none flex-1 text-sm text-gray-700 font-medium hover:bg-gray-200"
                                value="Tất cả"
                                disabled
                              />
                            </div>
                            <DownOutlined className="text-gray-700 text-xl mr-2" />
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
                                className="h-12 w-12 border rounded-full"
                              />
                              <div className="flex flex-1 justify-between items-center p-2 relative">
                                <div className="before:content-[''] before:h-[1px] before:w-full before:-bottom-2 before:left-0 before:absolute before:bg-slate-300">
                                  <h3 className="font-semibold text-gray-800">
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
