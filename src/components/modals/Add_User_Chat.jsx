import { Button, message } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import instance from "../../api/apiConfig";

export default function Add_User_Chat({ close, UserId, RoomId }) {
  const [messageApi, contextHolder] = message.useMessage();
  const userLocal = JSON.parse(localStorage.getItem("userLocal"));
  const [friends, setFriends] = useState([]);
  const [selectedUsers, setSelectUsers] = useState([]);

  const listFriend = async () => {
    try {
      const res = await instance.get(
        `friends/list-friended/${userLocal.UserId}`
      );
      setFriends(res.data.data);
    } catch (error) {
      console.log(error);
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
    if (selectedUsers.length === 0) {
      messageApi.open({
        type: "error",
        content: "Cần phải chọn ít nhất 1 bạn bè",
      });
    } else {
      try {
        const res = await instance.post("friends/add-friend-on-chat", {
          UserIds: selectedUsers,
          RoomId: RoomId,
        });
        console.log(res);
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <>
      {contextHolder}
      <div className="z-50 fixed top-0 bottom-0 right-0 left-0 bg-bgc-0.5 flex justify-center items-center">
        <div className="bg-white p-6 rounded w-[450px]">
          <div className="flex justify-between items-center py-3">
            <h3 className="text-xl font-semibold">Thêm thành viên</h3>
            <CloseOutlined
              onClick={close}
              className="cursor-pointer hover:bg-slate-200 p-2 rounded-full"
            />
          </div>
          <ul className="flex flex-col gap-2 min-h-[310px] max-h-[310px] overflow-y-auto">
            {friends.map((fr) => (
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
            ))}
          </ul>
          <hr className="my-6" />
          <div className="flex justify-end gap-3">
            <Button onClick={close}>Hủy</Button>
            <Button
              onClick={handleAddFriendOnChat}
              type="primary"
              className="bg-blue-600"
            >
              Xác nhận
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
