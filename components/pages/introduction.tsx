import Link from "next/link";
import Image from "next/image";
import { Mail, Paperclip } from "lucide-react";
import { buttonVariants } from "../ui/button";
import Container from "../shared/container";

const Introduction = () => {
    return (
        <Container>
            <div className="text-center" id="home">
                <h3 className="text-xl mb-3">Hola</h3>
                <h1 className="text-4xl font-bold mb3">Samas1503</h1>
                <h2 className="text-2xl text-gray-400">Backend Developer</h2>
                <div className="flex items-center">
                    <div className="flex flex-col md:flex-row gap-4 justify-between my-10 mx-auto">
                        <Link className={buttonVariants()} href= "#contact">
                            <Mail className="mr-2"/> Contacta conmigo
                        </Link>
                        <Link className={buttonVariants({variant: 'secondary'})} href= "https://drive.google.com/file/d/1dHpIEffAKokD0TdCKf2BsmWsPFE63DGg/view?usp=drive_link" target="_blank">
                            <Paperclip className="mr-2"/> Descargar CV
                        </Link>
                    </div>
                </div>
                <Image src="/profile.jpg" alt="Profile pic" style={{ borderRadius: "100%", width: "500px", height: "500px" }} width={500} height={500}/>
            </div>
        </Container>
    );
};

export default Introduction;