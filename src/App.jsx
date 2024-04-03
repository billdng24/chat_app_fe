import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import Home_Chat from "./components/Home_Chat";
import List from "./pages/List";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { useAuthContext } from "./context/AuthContext";

function App() {
  const { userLocal } = useAuthContext();

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={userLocal ? <Home_Chat /> : <Navigate to={"/login"} />}
        />
        <Route path="/list-request" element={<List />} />
        <Route
          path="/login"
          element={userLocal ? <Navigate to={"/"} /> : <Login />}
        />
        <Route
          path="/register"
          element={userLocal ? <Navigate to={"/"} /> : <Register />}
        />
      </Routes>
    </>
  );
}

export default App;
