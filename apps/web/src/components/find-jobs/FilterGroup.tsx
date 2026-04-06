import { Check, ChevronDown } from 'lucide-react';
import { FilterItem } from '@/types/job';

type FilterGroupProps = {
  title: string;
  items: FilterItem[];
  checked: string[];
  expanded: boolean;
  onToggle: (title: string, label: string, value?: string | number) => void;
  onToggleExpand: (title: string) => void;
};

export default function FilterGroup({
  title,
  items,
  checked,
  expanded,
  onToggle,
  onToggleExpand,
}: FilterGroupProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <button
        type="button"
        onClick={() => onToggleExpand(title)}
        className="flex items-center justify-between hover:bg-slate-100 rounded-[5px] px-2 py-2 w-full"
      >
        <h3 className="label-label-1-semi-bold text-slate-900">{title}</h3>
        <ChevronDown
          className={`h-5 w-5 text-slate-700 transition-transform ${
            expanded ? 'rotate-180' : 'rotate-0'
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="space-y-2.5 overflow-hidden">
          {items.map((item) => {
            const identifier =
              item.value !== undefined ? String(item.value) : item.label;
            const isChecked = checked.includes(identifier);
            return (
              <button
                key={identifier}
                type="button"
                onClick={() => onToggle(title, item.label, item.value)}
                className="flex cursor-pointer items-center gap-3 rounded-[5px] px-2 hover:bg-slate-100 hover:py-1 w-full 
                    transition-all duration-200 ease-in-out 
                    hover:translate-x-1"
              >
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-[5px] border-2 transition-all duration-200 ${
                    isChecked
                      ? 'border-slate-300 bg-indigo-700'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {isChecked && (
                    <Check className="h-4 w-4 text-white transition-all duration-200" />
                  )}
                </span>
                <span className="label-label-1-Regular text-slate-600">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
