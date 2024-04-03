import { Button, Spin, notification } from "antd";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import instance from "../../api/apiConfig";
import { useAuthContext } from "../../context/AuthContext";
import { io } from "socket.io-client";

export default function Add_User_Chat({ close }) {
  const [isFocused, setIsFocused] = useState(false);
  const { userLocal } = useAuthContext();
  const [friends, setFriends] = useState([]);
  const [selectedUsers, setSelectUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roomName, setRoomName] = useState("");
  const [file, setFile] = useState(null);
  const [image, setImage] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

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
    listFriend();
  }, []);

  const handleChecked = (id) => {
    if (selectedUsers.includes(id)) {
      setSelectUsers(selectedUsers.filter((userId) => userId !== id));
    } else {
      setSelectUsers([...selectedUsers, id]);
    }
  };

  const handleAddFriendOnChat = async () => {
    try {
      const formData = new FormData();
      if (file) {
        formData.append("image", file);
      }
      formData.append("RoomName", roomName);
      formData.append("CreatedByUserId", userLocal.UserId);
      selectedUsers.forEach((userId) => {
        formData.append("Member", userId);
      });
      // Thêm user hiện tại vào danh sách thành viên nếu cần
      formData.append("Member", userLocal.UserId);

      const res = await instance.post("rooms", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data.status === 201) {
        close();
        socket.emit("createRoom", res.data.data);
        notification.success({
          message: "Thành công",
          description: res.data.message,
        });
      }
    } catch (error) {
      const errorMessage =
        typeof error.response?.data?.message === "string"
          ? error.response.data.message
          : JSON.stringify(error.response.data);

      notification.error({
        message: "Lỗi",
        description: errorMessage || "Lỗi hệ thống.",
      });
    }
  };

  const handleRoomImage = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      1;
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  return (
    <>
      <div className="z-50 fixed top-0 bottom-0 right-0 left-0 bg-bgc-0.5 flex justify-center items-center">
        <div className="bg-white p-6 rounded mobile:w-[320px] tablet:w-[450px]">
          <div className="flex justify-between items-center pb-3">
            <h3 className="text-xl font-semibold">Tạo nhóm</h3>
            <CloseOutlined
              onClick={close}
              className="cursor-pointer hover:bg-slate-200 p-2 rounded-full"
            />
          </div>
          <div className="flex items-center mb-4">
            <label htmlFor="avatar-group" className="border rounded-full">
              <img
                src={
                  image
                    ? image
                    : "https://png.pngtree.com/png-clipart/20230817/original/pngtree-multiple-users-chat-group-avatar-picture-image_7997916.png"
                }
                alt=""
                className="h-10 w-10 cursor-pointer rounded-full"
              />
            </label>
            <input
              onChange={(e) => handleRoomImage(e)}
              type="file"
              id="avatar-group"
              hidden
            />
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Nhập tên nhóm ..."
              className="outline-none ml-3 flex-1 border-b-[1px] pb-1 pt-1 border-gray-300 focus:border-cyan-600"
              autoFocus
            />
          </div>
          <div
            className={`flex items-center justify-start border rounded-3xl py-2 px-3 ${
              isFocused ? "border-cyan-600" : "border-gray-300"
            }`}
          >
            <SearchOutlined className="text-gray-400 text-xl mr-2" />
            <input
              type="text"
              placeholder="Nhập tên, số điện thoại"
              className="outline-none flex-1"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            />
          </div>
          <div className="flex justify-between items-center py-3">
            <h3 className="text-xl font-semibold">Thêm thành viên</h3>
          </div>
          <ul className="flex flex-col gap-2 min-h-[310px] max-h-[310px] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Spin />
              </div>
            ) : (
              friends.map((fr) => (
                <li
                  key={fr.FriendshipId}
                  className="flex items-center gap-5 cursor-pointer p-2 hover:bg-[#E9F2FD] rounded-md"
                >
                  <input
                    onChange={() => handleChecked(fr.UserId)}
                    checked={selectedUsers.includes(fr.UserId)}
                    className="w-5 h-5 cursor-pointer"
                    type="checkbox"
                  />
                  <img className="h-10 rounded-full" src={fr.Image} alt="" />
                  <span>{fr.UserName}</span>
                </li>
              ))
            )}
          </ul>
          <hr className="my-6" />
          <div className="flex justify-end gap-3">
            <Button onClick={close}>Hủy</Button>
            <Button
              onClick={handleAddFriendOnChat}
              type="primary"
              className="bg-blue-600"
              disabled={selectedUsers.length <= 1}
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
