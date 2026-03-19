export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-16 md:py-24">
      <div className="section-container">
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-16">
          {/* Brand */}
          <div className="max-w-xs transition-opacity hover:opacity-80">
            <div className="flex items-center gap-2.5 mb-6 group cursor-pointer">
              <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 22V4c0-1.1.9-2 2-2h10l4 4v10c0 1.1-.9 2-2 2h-6"/>
                  <path d="M14 2v4h4"/>
                  <path d="M8 18l-4-4 4-4"/>
                </svg>
              </div>
              <span className="text-lg font-black tracking-tight text-gray-900">
                Clean<span className="text-gray-400">clip</span>
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

