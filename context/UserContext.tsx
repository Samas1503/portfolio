"use client";
import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  usuario: boolean | null;
  setUsuario: (u: boolean | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<boolean | null>(null);

  useEffect(() => {
    const cookieUsuario = document.cookie
      .split("; ")
      .find((row) => row.startsWith("usuario="))
      ?.split("=")[1];

    if (cookieUsuario === "true") setUsuario(true);
    else setUsuario(false);
  }, []);


  return (
    <UserContext.Provider value={{ usuario, setUsuario }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsuario = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUsuario debe usarse dentro de <UserProvider>");
  }
  return context;
};