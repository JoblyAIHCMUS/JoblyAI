import type { ComponentType } from 'react';

type CategoryTabProps = {
  name: string;
  icon: ComponentType<{ className?: string }>;
  active?: boolean;
  onClick?: () => void;
};

export default function CategoryTab({
  name,
  icon: Icon,
  active = false,
  onClick,
}: CategoryTabProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`h-44 w-44 shrink-0 rounded-lg border p-5 text-left transition-all duration-200 md:h-48 md:w-48 ${
        active
          ? 'border-indigo-700 bg-indigo-600 text-white'
          : 'border-slate-300 bg-white text-slate-900'
      }`}
    >
      <span className="flex h-full flex-col justify-between">
        <Icon
          className={`h-8 w-8 ${active ? 'text-white' : 'text-indigo-600'}`}
        />
        <span className="block text-2xl font-semibold leading-7 tracking-tight">
          {name}
        </span>
      </span>
    </button>
  );
}
