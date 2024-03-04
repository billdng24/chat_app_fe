import { Navigate, Outlet } from "react-router-dom";

export default function PrivateRouter() {
  const isLogin = true;
  return isLogin ? <Outlet /> : <Navigate to={"/login"} />;
}
