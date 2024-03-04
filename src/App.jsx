import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home_Chat from "./components/Home_Chat";
import List_Request from "./components/List_Request";
import Login from "./components/Login";
import Register from "./components/Register";
import PrivateRouter from "./routers/PrivateRouter";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route element={<PrivateRouter />}>
          <Route path="/chat" element={<Home_Chat />} />
          <Route path="/list-request" element={<List_Request />} />
        </Route>

        <Route index path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

export default App;
