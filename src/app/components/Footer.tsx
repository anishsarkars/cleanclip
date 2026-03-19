export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-16 md:py-24">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-16">
          {/* Brand */}
          <div className="max-w-xs transition-opacity hover:opacity-80">
            <div className="mb-6 group cursor-pointer">
              <span className="text-xl font-black tracking-tight text-gray-900 group-hover:text-black transition-colors">
                Clean<span className="text-gray-400 group-hover:text-gray-600">clip</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed font-medium m-0">
              Transforming video editing with AI-powered background removal. Fast, accurate, and incredibly simple.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 md:gap-24">
            {[
              { h: "Product", links: ["How it works", "Pricing", "API"] },
              { h: "Legal", links: ["Privacy", "Terms", "Refunds"] },
              { h: "Connect", links: ["Twitter / X", "Instagram", "Contact(Coming Soon)"] },
            ].map(({ h, links }) => (
              <div key={h}>
                <p className="text-[11px] font-bold text-gray-900 uppercase tracking-[0.15em] mb-6">{h}</p>
                <ul className="list-none m-0 p-0 flex flex-col gap-4">
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-gray-400 font-medium no-underline hover:text-gray-900 transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-50 pt-10 flex flex-col sm:row justify-between items-center gap-6">
          <p className="text-[13px] text-gray-400 font-medium m-0">© 2026 Cleanclip AI · Crafted with ❤️ in India</p>
          <div className="flex items-center gap-2.5 text-[12px] text-gray-400 font-bold bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}

