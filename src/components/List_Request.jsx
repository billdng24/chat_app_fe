import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Modal, notification } from "antd";
import Sidebar from "./Sidebar";
import instance from "../api/apiConfig";
import { UserAddOutlined } from "@ant-design/icons";
import { io } from "socket.io-client";

export default function List_Request() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [error, setError] = useState("");
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const userLocal = JSON.parse(localStorage.getItem("userLocal"));
  const [socket, setSocket] = useState(null);

  const showModal = () => {
    setIsModalOpen(true);
  };
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
    }
  };

  useEffect(() => {
    listFriendSuggest();
  }, []);

  // Xử lý gửi yêu cầu kết bạn
  const handleSendFriendRequest = async (id) => {
    try {
      const res = await instance.post("friends/send-friend-request", {
        UserSendId: userLocal.UserId,
        UserReceiverId: id,
      });
      listFriendSuggest();
      if (res.data.status === 201) {
        notification.success({
          message: "Thành công",
          description: res.data.message,
        });
        if (socket === null) return;
        socket.emit("sendRequest", {
          UserSendId: userLocal.UserId,
          UserReceiverId: id,
        });
      }
    } catch (error) {
      if (error.response.data.status === 500) {
        notification.error({
          message: "Lỗi",
          description: "Hệ thống đang bị lỗi, vui logng thử lại sau.",
        });
      }
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
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    listFriendRequest();
  }, []);

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
    }
  };

  useEffect(() => {
    if (socket === null) return;

    socket.on("getRequest", () => {
      listFriendSuggest();
    });
  }, [socket]);

  useEffect(() => {
    const newSocket = io("https://chat-app-socket-67e63ab891d1.herokuapp.com");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
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
        <div className="flex flex-col w-80 border">
          <div className="p-2 flex justify-center">
            <Button onClick={showModal} className="bg-blue-600" type="primary">
              Tạo phòng
            </Button>
          </div>
          <hr />
          <h3 className="text-center py-3 border">Danh sách gợi ý</h3>
          <ul className="flex flex-col">
            {friends.map((friend) => (
              <li
                key={friend.UserId}
                className="flex items-center justify-between p-3 hover:bg-[#E9F2FD] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img
                    className="h-12 rounded-full"
                    src={
                      friend.Image
                        ? friend.Image
                        : "https://i.pinimg.com/736x/3c/67/75/3c67757cef723535a7484a6c7bfbfc43.jpg"
                    }
                    alt=""
                  />
                  <span>{friend.UserName}</span>
                </div>
                <UserAddOutlined
                  onClick={() => handleSendFriendRequest(friend.UserId)}
                />
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full h-screen bg-slate-200">
          <h3 className="px-10 py-3 bg-white">
            Lời mời kết bạn({requests.length})
          </h3>
          <hr />
          <div className="flex flex-wrap gap-4 p-8 ">
            {requests.map((request, index) => (
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
                      handleConfirmRequest(request.RequestId, request.UserId)
                    }
                    className="bg-blue-600"
                    type="primary"
                  >
                    Đồng ý
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
