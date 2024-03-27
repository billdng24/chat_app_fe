import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [userLocal, setUserLocal] = useState(
    JSON.parse(localStorage.getItem("userLocal")) || null
  );
  useEffect(() => {
    localStorage.setItem("userLocal", JSON.stringify(userLocal));
  }, [userLocal]);

  return (
    <AuthContext.Provider value={{ userLocal, setUserLocal }}>
      {children}
    </AuthContext.Provider>
  );
};
