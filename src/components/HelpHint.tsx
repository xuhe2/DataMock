import type { TransformHelp } from "../data/transformHelp";

type HelpHintProps = {
  help: TransformHelp;
};

export function HelpHint({ help }: HelpHintProps) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={`${help.title} help`}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber-300 bg-amber-50 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
      >
        !
      </button>
      <span className="pointer-events-none absolute right-0 top-6 z-20 hidden w-72 rounded-md border border-slate-200 bg-white p-3 text-left shadow-lg group-hover:block group-focus-within:block">
        <span className="block text-sm font-semibold text-slate-900">{help.title}</span>
        <span className="mt-1 block text-xs leading-5 text-slate-600">{help.summary}</span>
        {help.formula ? (
          <code className="mt-2 block rounded bg-slate-100 px-2 py-1 font-mono text-[11px] text-slate-700">
            {help.formula}
          </code>
        ) : null}
        <span className="mt-2 block text-xs font-semibold text-slate-700">参数</span>
        <span className="mt-1 block space-y-1">
          {help.params.map((param) => (
            <span key={param.name} className="block text-xs leading-5 text-slate-600">
              <strong className="font-semibold text-slate-800">{param.name}</strong>: {param.description}
            </span>
          ))}
        </span>
        {help.notes?.length ? (
          <span className="mt-2 block space-y-1">
            {help.notes.map((note) => (
              <span key={note} className="block text-xs leading-5 text-slate-500">
                {note}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    </span>
  );
}
