import { UserAddOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { useEffect, useState } from "react";
import instance from "../api/apiConfig";
import { useAuthContext } from "../context/AuthContext";
import Add_Friend from "./modals/Add_Friend";
import Add_User_Chat from "./modals/Add_User_Chat";

export default function Search() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const { userLocal } = useAuthContext();
  const [showModalAddGroup, setShowModalAddGroup] = useState(false);
  const [showModalAdd, setShowModalAdd] = useState(false);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    const filterFriends =
      search.length === 0
        ? friends
        : friends.filter((friend) =>
            friend.UserName.toLowerCase().includes(search.toLowerCase())
          );
    setUsers(filterFriends);
  };

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

  const handleClose = () => {
    setShowModalAddGroup(false);
    setShowModalAdd(false);
  };

  return (
    <>
      {showModalAdd && <Add_Friend close={handleClose} />}
      {showModalAddGroup && <Add_User_Chat close={handleClose} />}
      <div className="flex items-center pc:max-w-[320px] justify-center gap-1 h-16 pc:h-20 border-b p-2 pc:p-3">
        <Input
          type="search"
          value={search}
          onChange={handleSearch}
          className="relative pc:w-[240px] bg-slate-200 font-medium text-slate-400 hover:bg-slate-200 hover:border-slate-200 border-[0px] outline-0"
          placeholder="Tìm kiếm"
        />
        <UserAddOutlined
          title="Thêm bạn"
          className="hover:bg-slate-200 pc:p-2 p-1 rounded-md"
          onClick={() => setShowModalAdd(true)}
        />
        <UsergroupAddOutlined
          title="Tạo nhóm chat"
          className="hover:bg-slate-200 pc:p-2 p-1 rounded-md"
          onClick={() => setShowModalAddGroup(true)}
        />
        {search !== "" && (
          <>
            <ul className="absolute max-h-[500px] overflow-auto bg-white sm_tablet:w-[475px] pc:w-[256px] sm_mobile:top-[2.9rem] tablte:w-[265px] pc:top-[3.4rem] left-16 pc:left-[5.5rem] z-10 border rounded-md shadow-gray-200 shadow-lg">
              {users.length > 0 ? (
                <>
                  {users.map((user) => (
                    <li
                      key={user.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-[#E9F2FD] cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <img
                          className="h-12 w-12 rounded-full"
                          src={user.Image}
                          alt="Ảnh đại diện"
                        />
                        {user.UserName}
                      </div>
                    </li>
                  ))}
                </>
              ) : (
                <>
                  <li className="flex h-24 border items-center justify-center px-3 py-2  cursor-not-allowed">
                    Không tìm thấy kết quả
                  </li>
                </>
              )}
            </ul>
          </>
        )}
      </div>
    </>
  );
}
