import type { ReactNode } from "react";
import { InfoDisclosure } from "@/components/info-disclosure";

type SectionHeadingProps = {
  title: ReactNode;
  description: ReactNode;
  level?: 1 | 2 | 3;
  id?: string;
  className?: string;
  headingClassName?: string;
};

export function SectionHeading({
  title,
  description,
  level = 2,
  id,
  className = "",
  headingClassName = "text-lg font-semibold tracking-tight text-zinc-950",
}: SectionHeadingProps) {
  const label = typeof title === "string" ? title : "this section";
  const heading =
    level === 1 ? (
      <h1 id={id} className={headingClassName}>{title}</h1>
    ) : level === 3 ? (
      <h3 id={id} className={headingClassName}>{title}</h3>
    ) : (
      <h2 id={id} className={headingClassName}>{title}</h2>
    );

  return <InfoDisclosure trigger={heading} label={label} description={description} className={className} />;
}
