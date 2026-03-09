export default function Footer() {
  const socialLinks = ['Twitter', 'LinkedIn', 'Instagram', 'Facebook'];

  return (
    <footer className="bg-slate-900 text-slate-400 py-10 px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <p className="text-sm">2026 @ JoblyAI. No rights reserved.</p>
        <div className="flex gap-4">
          {socialLinks.map((social) => (
            <button
              key={social}
              className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition text-xs font-bold text-white"
              aria-label={social}
            >
              {social[0]}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}