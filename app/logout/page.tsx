"use client"

import { Button } from "@/components/ui/button";
import { logout } from "../login/actions";

const LogOutButton = () => {
    return ( 
        <Button type="button" className="px-3" onClick={()=>logout()}> Logout</Button>
     );
}
 
export default LogOutButton;