import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export function AuthLeftColumn() {
  return (
    <div
      className="flex flex-col items-start justify-between rounded-xl bg-cover bg-center bg-no-repeat px-8 py-12 h-full"
      style={{
        backgroundImage:
          'url(https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/auth-image.jpg)',
      }}
    >
      {/* Stats Section */}
      <div className="flex flex-col items-start gap-3">
        <div className="flex items-center gap-1">
          <div className="h-8 w-1.5 rounded-full bg-accent-solid" />
          <div className="h-10 w-1.5 rounded-full bg-accent-solid" />
          <div className="h-8 w-1.5 rounded-full bg-accent-solid" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">100K+</p>
          <p className="text-sm text-white/80">People got hired</p>
        </div>
      </div>

      {/* Testimonial Card */}
      <div className="relative w-full max-w-sm mt-auto">
        <div className="absolute -inset-2 -z-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 blur-2xl opacity-40" />
        <Card className="border-0 bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage
                src="https://jobly-dev-assets.s3.ap-southeast-1.amazonaws.com/assets/public/auth-avatar.jpg"
                alt="Courtney Miller"
                className="object-cover"
              />
              <AvatarFallback>AS</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">Courtney Miller</p>
              <p className="text-xs text-muted-foreground">
                Lead Engineer at Canva
              </p>
            </div>
          </div>
          <p className="text-sm italic text-foreground">
            "Great platform for the job seeker that searching for new career
            heights."
          </p>
        </Card>
      </div>
    </div>
  );
}
