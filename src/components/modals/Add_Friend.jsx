import {
  CaretDownOutlined,
  CloseOutlined,
  FileSyncOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Button, Spin, notification } from "antd";
import { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import instance from "../../api/apiConfig";
import { io } from "socket.io-client";

export default function Add_Friend({ close }) {
  const { userLocal } = useAuthContext();
  const [friends, setFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

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
    listFriendSuggest();
  }, []);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="z-50 fixed top-0 bottom-0 right-0 left-0 bg-bgc-0.5 flex justify-center items-center">
        <div className="bg-white p-6 rounded w-[450px]">
          <div className="flex justify-between items-center pb-3">
            <h3 className="text-xl font-semibold">Thêm bạn</h3>
            <CloseOutlined
              onClick={close}
              className="cursor-pointer hover:bg-slate-200 p-2 rounded-full"
            />
          </div>
          <div className="flex items-center mb-4">
            <div className="border-b-[1px] border-gray-300 pb-1 pt-1 mr-3 font-medium text-slate-700">
              <span>Việt Nam (+84) </span>
              <CaretDownOutlined />
            </div>
            <input
              type="text"
              placeholder="Số điện thoại"
              className="outline-none flex-1 border-b-[1px] pb-1 pt-1 border-gray-300 focus:border-cyan-600"
              autoFocus
            />
          </div>
          <div className="flex items-center py-3 text-gray-400">
            <FileSyncOutlined />
            <h3 className="text-sm ml-2 font-semibold">Có thể bạn biết</h3>
          </div>
          <ul className="flex flex-col gap-2 min-h-[310px] max-h-[310px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Spin />
              </div>
            ) : (
              friends.map((friend, index) => (
                <li
                  key={index}
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
              ))
            )}
          </ul>
          <hr className="my-6" />
          <div className="flex justify-end gap-3">
            <Button onClick={close}>Hủy</Button>
            <Button type="primary" className="bg-blue-600">
              Tìm kiếm
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
