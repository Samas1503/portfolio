const Spinner = () => (
  <div role="status" className="flex justify-center py-10">
    <span
      aria-hidden="true"
      className="size-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
    />
    <span className="sr-only">Cargando…</span>
  </div>
);

export default Spinner;
