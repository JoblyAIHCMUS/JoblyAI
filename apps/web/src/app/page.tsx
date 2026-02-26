import {
  ArrowRight,
  Github,
  Paintbrush,
  Sparkles,
  Terminal,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

const features = [
  {
    title: 'Composable primitives',
    description:
      'Radix + tailwind + cva give you accessible, themeable building blocks.',
    icon: Terminal,
  },
  {
    title: 'Design tokens out of the box',
    description:
      'CSS variables and Tailwind config keep light/dark palettes consistent.',
    icon: Paintbrush,
  },
  {
    title: 'Ship fast, stay consistent',
    description:
      'Drop in shadcn/ui components and iterate without fighting styles.',
    icon: Sparkles,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/50">
      <div className="container flex min-h-screen flex-col items-center justify-center gap-12 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="rounded-full border border-dashed px-4 py-1 text-xs font-medium text-muted-foreground">
            UI powered by shadcn/ui
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Build the Jobly experience faster
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A Tailwind + Radix component stack with sensible defaults, theme
            tokens, and composable primitives.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" className="gap-2">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="gap-2" asChild>
            <a
              href="https://github.com/JoblyAIHCMUS/JoblyAI"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-4 w-4" />
              View repo
            </a>
          </Button>
        </div>

        <div className="grid w-full gap-4 md:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-lg border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
              </div>
              <Button
                variant="ghost"
                className="justify-start gap-2 px-0 text-sm"
              >
                Learn more
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
