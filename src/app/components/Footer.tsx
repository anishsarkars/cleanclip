export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #f3f4f6", background: "#fff", padding: "40px 0" }}>
      <div className="section-container">
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 40, marginBottom: 32 }}>
          {/* Brand */}
          <div style={{ maxWidth: 220 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, background: "#111827", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 22V4c0-1.1.9-2 2-2h10l4 4v10c0 1.1-.9 2-2 2h-6"/>
                  <path d="M14 2v4h4"/>
                  <path d="M8 18l-4-4 4-4"/>
                </svg>
              </div>
              <span style={{ fontSize: 16, fontWeight: 900, color: "#111827", letterSpacing: "-0.02em" }}>
                Clean<span style={{ color: "#9ca3af" }}>clip</span>
              </span>
            </div>
            <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.65, margin: 0 }}>
              AI video background removal. Free to start, no editing skills needed.
            </p>
          </div>

          {/* Links */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 120px)", gap: 32 }}>
            {[
              { h: "Product", links: ["How it works", "Pricing", "API"] },
              { h: "Legal", links: ["Privacy", "Terms", "Refunds"] },
              { h: "Connect", links: ["Twitter / X", "Instagram", "Contact"] },
            ].map(({ h, links }) => (
              <div key={h}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#111827", margin: "0 0 12px" }}>{h}</p>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {links.map((l) => (
                    <li key={l}>
                      <a href="#" style={{ fontSize: 12, color: "#9ca3af", textDecoration: "none" }}
                        onMouseOver={(e) => (e.currentTarget.style.color = "#111827")}
                        onMouseOut={(e) => (e.currentTarget.style.color = "#9ca3af")}
                      >{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 20, display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>© 2026 Cleanclip AI · Made with ❤️ in India</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9ca3af" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", display: "inline-block" }}/>
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
}
