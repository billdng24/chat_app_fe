import Sidebar from "./Sidebar";
import List_Chat from "../pages/List_Chat";

export default function Home_Chat() {
  return (
    <>
      <div className="flex">
        <Sidebar />
        <List_Chat />
      </div>
    </>
  );
}