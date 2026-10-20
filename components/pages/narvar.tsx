import { itemsNavbar } from "@/data";
import { ToggleTheme } from "../theme/toogle-theme";
import LogOutButton from "@/app/logout/page";

const Navbar = () => {
  return (
    <nav
      aria-label="Navegación"
      className="fixed inset-x-0 bottom-5 z-30 flex justify-center px-3 lg:hidden"
    >
      <div className="flex items-center gap-1 rounded-full border border-border bg-card/80 px-2 py-1.5 shadow-lg backdrop-blur-md">
        {itemsNavbar.map((item) => (
          <a
            key={item.id}
            href={item.link}
            aria-label={item.title}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-accent hover:text-primary"
          >
            {item.icon}
          </a>
        ))}
        <ToggleTheme />
        <LogOutButton />
      </div>
    </nav>
  );
};

export default Navbar;
