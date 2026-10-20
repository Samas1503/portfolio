const Footer = () => {
  return (
    <footer className="max-w-md pb-28 text-sm text-muted-foreground lg:pb-0">
      <p>
        Diseñado y desarrollado por{" "}
        <span className="text-card-foreground">Samuel Elias Paredes</span> con
        Next.js, Tailwind CSS, Supabase y Three.js.
      </p>
      <p className="mt-2">&copy; {new Date().getFullYear()} · Samas1503</p>
    </footer>
  );
};

export default Footer;
