export function AuthHeader() {
  return (
    <div className="mb-8 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-accent-solid" />
        <span className="text-xl font-bold">JoblyAI</span>
      </div>
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
