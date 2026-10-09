import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/utils/cn";

export function FilterSelect({
  label,
  icon,
  options,
  value,
  onChange,
  multiple = true,
  className,
}: {
  label: string;
  icon?: React.ReactNode;
  options: { value: string; label: string }[];
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggle(v: string) {
    if (!multiple) {
      onChange(value[0] === v ? [] : [v]);
      setOpen(false);
      return;
    }
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  }

  const active = value.length > 0;

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[12px] font-medium transition",
          active
            ? "border-accent/40 bg-accent/8 text-accent"
            : "border-ink/10 bg-white text-mute hover:border-ink/20 hover:text-mist",
        )}
      >
        {icon}
        {label}
        {active && (
          <span className="rounded-full bg-accent px-1.5 text-[10px] font-semibold text-white">
            {value.length}
          </span>
        )}
        <ChevronDown size={13} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable={multiple}
          className="absolute left-0 top-11 z-30 w-56 overflow-hidden rounded-xl border border-ink/10 bg-white py-1.5 shadow-[0_20px_50px_-12px_rgba(13,33,56,0.3)]"
        >
          <p className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-mute-2">
            {label}
          </p>
          <div className="max-h-60 overflow-y-auto">
            {options.map((o) => {
              const on = value.includes(o.value);
              return (
                <button
                  key={o.value}
                  type="button"
                  role="option"
                  aria-selected={on}
                  onClick={() => toggle(o.value)}
                  className={cn(
                    "flex w-full items-center justify-between px-3 py-2 text-left text-[13px] transition",
                    on ? "text-accent" : "text-mist hover:bg-ink/4",
                  )}
                >
                  {o.label}
                  {on && <Check size={14} />}
                </button>
              );
            })}
          </div>
          {active && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mt-1 flex w-full items-center gap-1.5 border-t border-ink/6 px-3 py-2 text-[12px] text-mute transition hover:text-mist"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function ClearFilters({ onClear, className }: { onClear: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClear}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-[12px] font-medium text-mute transition hover:bg-ink/5 hover:text-mist",
        className,
      )}
    >
      <X size={13} />
      Clear Filters
    </button>
  );
}

export function FilterBarShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 hidden items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute-2 sm:inline-flex">
        <SlidersHorizontal size={12} />
        Filters
      </span>
      {children}
    </div>
  );
}

export function opts(values: string[]) {
  return values.map((v) => ({ value: v, label: v }));
}
