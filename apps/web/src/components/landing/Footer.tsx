import { X, Linkedin , Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const socialLinks = [
    { name: 'Twitter', icon: X, url: '#' },
    { name: 'LinkedIn', icon: Linkedin, url: '#' },
    { name: 'Instagram', icon: Instagram, url: '#' },
    { name: 'Facebook', icon: Facebook, url: '#' },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400 py-10 px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <p className="text-sm">2026 @ JoblyAI. No rights reserved.</p>
        <div className="flex gap-4">
          {socialLinks.map(({ name, icon: Icon, url }) => (
            <a
              key={name}
              href={url}
              className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition text-white hover:text-emerged-600"
              aria-label={name}
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}