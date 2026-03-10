import { Check, ChevronDown } from 'lucide-react';
import { FilterItem } from '@/types/job';

type FilterGroupProps = {
  title: string;
  items: FilterItem[];
  checked: string[];
  expanded: boolean;
  onToggle: (title: string, label: string) => void;
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
        className="flex items-center justify-between"
      >
        <h3 className="text-base font-semibold leading-6 text-slate-900">
          {title}
        </h3>
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
        <div className="space-y-3.5 overflow-hidden">
          {items.map((item) => {
            const isChecked = checked.includes(item.label);
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onToggle(title, item.label)}
                className="flex cursor-pointer items-center gap-3"
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-[5px] border-2 ${
                    isChecked
                      ? 'border-slate-300 bg-indigo-700'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  {isChecked ? <Check className="h-4 w-4 text-white" /> : null}
                </span>
                <span className="text-base leading-6 text-slate-600">
                  {item.label} ({item.count})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
