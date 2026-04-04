import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center space-y-6 text-center px-4">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access the employer dashboard. Only
            users with an employer account can access this area.
          </p>
        </div>

        <div className="flex gap-4">
          <Link
            href="/"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/login"
            className="px-6 py-2 border border-input bg-background hover:bg-accent rounded-lg transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </main>
  );
}
