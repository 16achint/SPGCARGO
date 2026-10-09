import { Skel } from "@/components/app/shared/primitives";

export function SKelPreview({ kind }: { kind: "table" | "cards" | "list" }) {
  if (kind === "cards") {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-ink/6 bg-white p-3">
            <Skel className="h-3 w-20" />
            <Skel className="h-4 w-32" />
            <Skel className="h-2 w-full" />
            <Skel className="h-2 w-3/4" />
          </div>
        ))}
      </div>
    );
  }
  if (kind === "list") {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-ink/6 bg-white px-3 py-2.5">
            <Skel className="h-8 w-8 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skel className="h-3 w-40" />
              <Skel className="h-2 w-64" />
            </div>
            <Skel className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-3 rounded-lg bg-white px-3 py-2">
        <Skel className="h-3 w-24" />
        <Skel className="h-3 w-32" />
        <Skel className="h-3 w-20" />
        <Skel className="ml-auto h-3 w-14" />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-lg border border-ink/5 bg-white px-3 py-2.5">
          <Skel className="h-3 w-24" />
          <Skel className="h-3 w-32" />
          <Skel className="h-3 w-20" />
          <Skel className="ml-auto h-3 w-14" />
        </div>
      ))}
    </div>
  );
}
