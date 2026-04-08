import { ReactNode } from "react";

type LessonFormSectionProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function LessonFormSection({
  title,
  children,
  className = "space-y-3",
}: LessonFormSectionProps) {
  return (
    <section className={`${className} border-t border-zinc-100 pt-4 first:border-t-0 first:pt-0`}>
      <div className="border-b border-zinc-100 pb-2">
        <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}
