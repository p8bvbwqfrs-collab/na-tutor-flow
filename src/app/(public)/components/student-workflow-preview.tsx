type StudentWorkflowPreviewProps = {
  className?: string;
};

export function StudentWorkflowPreview({ className = "" }: StudentWorkflowPreviewProps) {
  return (
    <div
      role="img"
      aria-label="Tutor Flow student page showing current payment position, the next lesson and a parent update"
      className={`cursor-default select-none overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-left shadow-sm sm:p-4 ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 pb-2 text-[10px] font-medium uppercase tracking-wide text-zinc-500">
        <span>Product preview</span>
        <span>Example data</span>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 py-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Harris</p>
          <p className="mt-0.5 text-[11px] text-zinc-500">Maths · Parent contact saved</p>
        </div>
        <span className="rounded-md bg-blue-700 px-2.5 py-1.5 text-[11px] font-medium text-white">
          Log lesson
        </span>
      </div>

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
          Current position
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Outstanding</p>
            <p className="mt-1 text-lg font-semibold text-amber-950">£50.00</p>
            <p className="mt-1 text-[10px] text-zinc-500">1 unpaid lesson</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Next lesson</p>
            <p className="mt-1 text-sm font-semibold text-zinc-900">15 Aug</p>
            <p className="mt-1 text-[10px] text-zinc-500">16:00</p>
          </div>
        </div>
      </div>

      <div className="mt-3 overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <div className="flex items-center justify-between gap-3 px-3 py-2.5">
          <div>
            <p className="text-xs font-semibold text-zinc-900">Latest parent update</p>
            <p className="mt-0.5 text-[10px] text-zinc-500">11 Aug · ready to share</p>
          </div>
          <span className="rounded-md border border-zinc-200 px-2 py-1 text-[10px] font-medium text-zinc-700">
            Share update
          </span>
        </div>
        <div className="border-t border-zinc-200 p-3">
          <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">What we covered</p>
          <p className="mt-1 text-xs font-medium leading-5 text-zinc-900">
            Trigonometric functions and solving equations
          </p>
        </div>
        <div className="grid grid-cols-2 border-t border-zinc-200">
          <div className="p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Next focus</p>
            <p className="mt-1 text-[11px] leading-4 text-zinc-600">Using CAST diagrams confidently</p>
          </div>
          <div className="border-l border-zinc-200 p-3">
            <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Homework</p>
            <p className="mt-1 text-[11px] leading-4 text-zinc-600">Practise textbook questions</p>
          </div>
        </div>
      </div>
    </div>
  );
}
