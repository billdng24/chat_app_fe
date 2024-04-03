import {
  FileImageOutlined,
  LeftOutlined,
  MenuFoldOutlined,
  MessageOutlined,
  PhoneOutlined,
  SearchOutlined,
  SendOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import InputEmoji from "react-input-emoji";
import instance from "../api/apiConfig";
import { io } from "socket.io-client";
import { useAuthContext } from "../context/AuthContext";
import Search from "../components/Search";
import { formatTime } from "../utils/formatDate";

export default function List_Chat() {
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const { userLocal } = useAuthContext();
  const [friends, setFriends] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState({});
  const [roomImage, setRoomImage] = useState("");
  const [friendChat, setFriendChat] = useState(null);
  const [chatWithFriend, setChatWithFriend] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const bottomRef = useRef();
  const [selectedItem, setSelectedItem] = useState(null);
  const [hidden, setHidden] = useState(false);

  // Xử lý cuộn trang khi gửi tin nhắn
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatWithFriend]);

  // Tạo io
  useEffect(() => {
    const newSocket = io("http://localhost:3000");

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Gửi sendMessage qua socket
  useEffect(() => {
    if (socket === null) return;

    // Dữ liệu cần gửi đi là chuỗi tin nhấn giữa user đăng nhập và user được gửi
    // + Id của user nhận
    socket.emit("sendMessage", { chatWithFriend, friendChat });
  }, [chatWithFriend]);

  // Lấy dữ liệu từ socket về
  useEffect(() => {
    // Lấy dữ liệu thông qua sự kiện
    if (socket === null) return;

    socket.on("getMessage", (message) => {
      // Kiểm tra các phản hồi từ socket trả về có phải user đang đâng nhập và user được nhận message
      if (
        (message.UserReceiverId === userLocal.UserId &&
          message.UserSendId === friendChat) ||
        (message.UserSendId === userLocal.UserId &&
          message.UserReceiverId === friendChat)
      ) {
        // Cập nhật lại tin nhắn của 2 user
        setChatWithFriend((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("getMessage");
    };
  }, [socket, chatWithFriend]);

  useEffect(() => {
    if (socket === null) return;

    socket.on("getRoom", (message) => {
      setRooms([...rooms, message]);
    });
  });

  // Lấy thông tin người muốn nhắn tin
  const getInfoUserChat = async (info) => {
    info.UserName
      ? setRoomName({ name: info.UserName, type: "friends" })
      : setRoomName({
          name: info.RoomName,
          type: "rooms",
        });
    setRoomImage(info.Image);
    setFriendChat(info.UserId);
    setHidden(true);
  };

  //
  const listChatUserWithFriend = useCallback(async () => {
    try {
      const res = await instance.post("friends/list-chat-user", {
        UserSendId: userLocal.UserId,
        UserReceiverId: friendChat,
      });
      setChatWithFriend(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }, [userLocal.UserId, friendChat]);

  useEffect(() => {
    listChatUserWithFriend();
  }, [friendChat]);

  // Xử lý gửi tin nhắn
  const handleSendMessage = useCallback(
    async (value) => {
      try {
        await instance.post("friends/add-chat-user", {
          UserSendId: userLocal.UserId,
          UserReceiverId: friendChat,
          Content: value,
        });
        listChatUserWithFriend();
        socket.emit("sendMessage", {
          UserSendId: userLocal.UserId,
          UserReceiverId: friendChat,
          Content: value,
        });
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }
    },
    [userLocal.UserId, friendChat, listChatUserWithFriend, socket]
  );

  const fetchData = async () => {
    try {
      const [result1, result2] = await Promise.all([
        instance.get(`rooms/list-room/${userLocal.UserId}`),
        instance.get(`friends/list-friended/${userLocal.UserId}`),
      ]);
      setRooms(result1.data.data);
      setFriends(result2.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCloseChat = () => {
    setHidden(false);
  };

  return (
    <>
      <div
        className={`${
          hidden ? "hidden tablet:block" : ""
        } flex-col w-full tablet:w-80 border-r flex-1`}
      >
        <Search />
        <div>
          <ul className="flex flex-col max-h-screen overflow-auto">
            {isLoading ? (
              <li className="flex items-center justify-center h-full">
                <Spin />
              </li>
            ) : friends.length === 0 && rooms.length === 0 ? (
              <li className=" cursor-pointer px-6 py-3 gap-4 hover:bg-[#f9fafb]">
                <div className="flex flex-col">Không có dữ liệu</div>
              </li>
            ) : (
              [...friends, ...rooms].map((fr, index) => (
                <li
                  key={index}
                  className={`cursor-pointer p-3 tablet:px-6 gap-4  ${
                    selectedItem === index
                      ? "bg-blue-50"
                      : "hover:bg-[rgb(249,250,251)]"
                  }`}
                >
                  <div
                    className="flex justify-between items-center"
                    onClick={() => {
                      getInfoUserChat(fr);
                      setSelectedItem(index);
                    }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <img
                        className="h-10 w-10 sm_tablet:h-12 sm_tablet:w-12 tablet:h-14 tablet:w-14 rounded-full"
                        src={fr.Image}
                        alt=""
                      />
                      <span className="font-semibold truncate text-sm sm_tablet:text-base">
                        {fr.UserName || fr.RoomName}
                      </span>
                    </div>
                    <MessageOutlined
                      className="cursor-pointer hover:bg-slate-300 p-2
                    rounded-full"
                    />
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
      {roomName.name && hidden ? (
        <>
          <div className="flex flex-col w-full overflow-y-auto">
            <div className="h-[4.55rem] tablet:h-20 flex items-center justify-between px-2 py-0 tablet:px-4 tablet:py-2 border-b w-full">
              <div className="flex items-center gap-2 tablet:gap-4">
                <LeftOutlined
                  onClick={handleCloseChat}
                  className="block tablet:hidden px-3"
                />
                <img
                  className="h-10 w-10 tablet:h-11 tablet:w-11 hidden sm_tablet:block rounded-full"
                  src={roomImage}
                  alt=""
                />
                <div className="flex flex-col min-w-[120px] text-sm overflow-hidden">
                  <span className="font-semibold truncate">
                    {roomName.name}
                  </span>
                  {roomName.type === "friends" ? (
                    <p className="truncate">
                      {userLocal ? "Đang hoạt động" : "Hoạt động 6 phút trước"}
                    </p>
                  ) : (
                    <p className="truncate">4 Thành viên </p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <PhoneOutlined className="text-lg sm_tablet:text-[22px] text-slate-700 font-light cursor-pointer hover:bg-gray-200 p-1 sm_tablet:p-2 rounded-lg rotate-90" />
                <SearchOutlined className="text-lg sm_tablet:text-[22px] text-slate-700 font-light cursor-pointer hover:bg-gray-200 p-1 sm_tablet:p-2 rounded-lg" />
                <VideoCameraOutlined className="text-lg sm_tablet:text-[22px] text-slate-700 font-light cursor-pointer hover:bg-gray-200 p-1 sm_tablet:p-2 rounded-lg" />
                <MenuFoldOutlined className="text-lg sm_tablet:text-[22px] text-slate-700 font-light cursor-pointer hover:bg-gray-200 p-1 sm_tablet:p-2 rounded-lg" />
              </div>
            </div>
            <div
              className="bg-slate-200 w-full h-auto flex-1 p-5 overflow-auto"
              style={{ maxHeight: "calc(100vh - 120px)" }}
            >
              {chatWithFriend.map((message, index) => (
                <div key={index}>
                  {message.UserSendId === userLocal.UserId ? (
                    <>
                      <div className="flex justify-end mb-2">
                        <div className="w-auto min-w-[200px] max-w-[30%] p-2 text-black rounded-md flex flex-col bg-sky-100">
                          <span className="pb-2">{message.Content}</span>
                          <span className="text-sm">
                            {formatTime(message.CreatedDate)}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-start mb-2">
                        <div className="bg-white w-auto min-w-[200px] max-w-[30%] p-2 text-black rounded-md flex flex-col">
                          <span className="pb-2">{message.Content}</span>
                          <span className="text-sm">
                            {formatTime(message.CreatedDate)}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="w-full p-1 tablet:p-3 bottom-0 bg-white">
              <div className="flex justify-between gap-1 tablet:gap-4 items-center h-10">
                <input type="file" hidden id="file" />
                <label htmlFor="file">
                  <FileImageOutlined className="text-2xl cursor-pointer text-gray-600" />
                </label>
                <div className="w-full overflow-hidden sm_tablet:h-12">
                  <InputEmoji
                    ref={inputRef}
                    value={text}
                    onChange={setText}
                    cleanOnEnter
                    keepOpened={true}
                    onEnter={handleSendMessage}
                    placeholder="Nhập nội dung tin nhắn"
                  />
                </div>
                {text ? (
                  <SendOutlined
                    className="cursor-pointer text-blue-600"
                    onClick={handleSendMessage}
                  />
                ) : (
                  <SendOutlined className="cursor-not-allowed text-gray-400" />
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div
            className="bg-center bg-no-repeat w-full hidden tablet:block"
            style={{
              backgroundImage: `url('https://t4.ftcdn.net/jpg/04/72/65/73/360_F_472657366_6kV9ztFQ3OkIuBCkjjL8qPmqnuagktXU.jpg')`,
            }}
          ></div>
        </>
      )}
    </>
  );
}
