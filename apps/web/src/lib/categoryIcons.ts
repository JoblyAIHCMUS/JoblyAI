import {
  Briefcase,
  Building2,
  Code,
  Globe,
  Layers,
  Paintbrush,
  Wallet,
  Wrench,
  ShoppingBag,
  HeartPulse,
} from 'lucide-react';
import type { ComponentType } from 'react';

const CATEGORY_ICON_POOL: ComponentType<{ className?: string }>[] = [
  Paintbrush,
  Wallet,
  Globe,
  Briefcase,
  Code,
  Building2,
  Layers,
  Wrench,
  ShoppingBag,
  HeartPulse,
];

export function getCategoryIconByIndex(
  index: number
): ComponentType<{ className?: string }> {
  return CATEGORY_ICON_POOL[index % CATEGORY_ICON_POOL.length];
}
