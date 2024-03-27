import {
  BellOutlined,
  FileImageOutlined,
  MessageOutlined,
  SendOutlined,
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
  const [showDialog, setShowDialog] = useState(false);
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

  return (
    <>
      <div className="flex flex-col w-80 border-r">
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
                  className={`cursor-pointer px-6 py-3 gap-4  ${
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
                        className="h-14 w-14 rounded-full"
                        src={fr.Image}
                        alt=""
                      />
                      <span className="font-semibold">
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
      {roomName.name ? (
        <>
          <div className="flex flex-col w-full overflow-y-auto">
            <div className="h-20  flex items-center justify-between px-4 py-2 border-b w-full">
              <div className="flex items-center gap-4">
                <img
                  className="h-14 w-14 rounded-full"
                  src={roomImage}
                  alt=""
                />
                <div className="flex flex-col">
                  <span className="font-semibold">{roomName.name}</span>
                  {roomName.type === "friends" ? (
                    <p>
                      {userLocal ? "Đang hoạt động" : "Hoạt động 6 phút trước"}
                    </p>
                  ) : (
                    <p>4 Thành viên </p>
                  )}
                </div>
              </div>
              <div>
                <BellOutlined
                  onClick={() => setShowDialog(!showDialog)}
                  className="text-3xl absolute right-6 top-4 cursor-pointer hover:bg-[#E9F2FD] p-2 rounded-full"
                />
                <span className="bg-red-500 px-2 rounded-xl text-sm right-5 top-5 text-white z-10 absolute">
                  10
                </span>
                {showDialog && (
                  <ul className="bg-white absolute right-8 top-14 border rounded pt-2 w-[480px] max-h-[400px] overflow-y-auto">
                    <div className="sticky top-0 bg-white z-20 font-semibold px-5 text-xl mb-2">
                      Tất cả thông báo
                    </div>
                    <li className="py-2 px-2 cursor-pointer hover:bg-[#E9F2FD]">
                      <div className="flex gap-3">
                        <img
                          className="h-14 rounded-full"
                          src="https://tse4.mm.bing.net/th?id=OIP.0i9PRZGvJbv7kG7XoQUAWQHaHa&pid=Api&P=0&h=180"
                          alt=""
                        />
                        <div className="flex flex-col justify-center">
                          <div>Tin nhắn mới đến từ Nguyên</div>
                          <div className="text-sm">Chào em nha</div>
                        </div>
                      </div>
                    </li>
                    <li className="py-2 px-2 cursor-not-allowed">
                      <div className="flex gap-3 justify-center">
                        <h2>Không có thông báo mới</h2>
                      </div>
                    </li>
                  </ul>
                )}
              </div>
            </div>
            <div
              className="bg-slate-200 w-full h-auto flex-1 p-5 overflow-auto"
              style={{ maxHeight: "calc(100vh - 160px)" }}
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
            <div className="w-full px-3 bottom-0 py-3 bg-white">
              <div className="flex justify-between gap-4 items-center">
                <input type="file" hidden id="file" />
                <label htmlFor="file">
                  <FileImageOutlined className="text-2xl cursor-pointer text-gray-600" />
                </label>
                <InputEmoji
                  ref={inputRef}
                  className="w-full"
                  value={text}
                  onChange={setText}
                  cleanOnEnter
                  keepOpened={true}
                  onEnter={handleSendMessage}
                  placeholder="Nhập nội dung tin nhắn"
                />
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
            className="bg-cntain bg-center bg-no-repeat w-full"
            style={{
              backgroundImage: `url('https://t4.ftcdn.net/jpg/04/72/65/73/360_F_472657366_6kV9ztFQ3OkIuBCkjjL8qPmqnuagktXU.jpg')`,
            }}
          ></div>
        </>
      )}
    </>
  );
}
