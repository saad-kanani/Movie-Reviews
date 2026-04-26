import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext({
  user: null,
  register: (userData: any) => {},
  login: (userData: any) => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      // Optionally, fetch user details from the server using the userId
      // and set the user state with the fetched data.
    }
  }, []);

  const register = async (userData: any) => {
    try {
      const { data } = await api.post("/users", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });
      setUser(data);
      localStorage.setItem("userId", data.id);
    } catch (err) {
      console.error("Registration error:", err);
      throw new Error("Failed to register. Please try again.");
    }
  };

  const login = async (userData: any) => {
    try {
      const { data } = await api.post("/users/login", {
        email: userData.email,
        password: userData.password,
      });
      setUser(data);
      localStorage.setItem("userId", data.id);
    } catch (err) {
      console.error("Login error:", err);
      throw new Error("Failed to login. Please try again.");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
