"use client"

import { Button } from "@/components/ui/button";
import { logout } from "../login/actions";
import { useUsuario } from "@/context/UserContext";
import { LogOut } from "lucide-react";

const LogOutButton = () => {
    const { usuario, setUsuario } = useUsuario();
    const loggedOut = () => {
        logout();
        setUsuario(false);
    }
    return ( usuario &&
        <Button type="button" variant="outline" className="px-3" onClick={loggedOut} aria-label="Cerrar sesión" title="Cerrar sesión">
            <LogOut />
            <span className="hidden lg:inline">Cerrar sesión</span>
        </Button>
     );
}
 
export default LogOutButton;