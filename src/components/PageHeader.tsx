import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-6 gap-4">
      <div>
        {eyebrow && (
          <div className="font-mono uppercase text-xs tracking-[0.25em] text-neutral-500 mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="font-mono text-3xl font-extrabold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <div className="text-sm text-neutral-400 mt-1">{subtitle}</div>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
