interface SectionProps {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}

const Section = ({ id, number, title, children }: SectionProps) => {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="reveal mb-24 scroll-mt-16 md:mb-32 lg:scroll-mt-24"
    >
      <div className="sticky top-0 z-20 -mx-6 mb-6 bg-background/80 px-6 py-4 backdrop-blur md:-mx-12 md:px-12 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:py-0 lg:backdrop-blur-none">
        <h2
          id={`${id}-title`}
          className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-foreground lg:text-base"
        >
          <span className="font-mono text-primary">{number}.</span>
          {title}
          <span className="h-px flex-1 bg-border" aria-hidden="true" />
        </h2>
      </div>
      {children}
    </section>
  );
};

export default Section;
