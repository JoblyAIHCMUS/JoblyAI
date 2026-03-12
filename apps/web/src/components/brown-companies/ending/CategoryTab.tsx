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
      className={`min-w-48 rounded-lg border px-6 py-6 text-left transition-colors ${
        active
          ? 'border-indigo-700 bg-indigo-600 text-white'
          : 'border-slate-300 bg-white text-slate-900'
      }`}
    >
      <Icon
        className={`mb-8 h-8 w-8 ${active ? 'text-white' : 'text-indigo-600'}`}
      />
      <span className="block text-3xl font-semibold leading-8 tracking-tight">
        {name}
      </span>
    </button>
  );
}
