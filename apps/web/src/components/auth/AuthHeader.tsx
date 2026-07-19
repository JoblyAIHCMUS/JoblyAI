import Link from 'next/link';
import { Logo } from '@/components/ui/jobly-logo';

export function AuthHeader() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <Link href="/">
        <div className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer">
          <Logo size="md" />
          <span className="text-xl font-bold">JoblyAI</span>
        </div>
      </Link>
      <nav className="hidden md:block">
        <a
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Back to home
        </a>
      </nav>
    </div>
  );
}

