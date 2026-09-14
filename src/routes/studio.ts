import { studioPage } from "../ui/studio";

export function studio(): Response {
  const page = studioPage()
    .replace("Generar 2 propuestas ✦", "Generar Diseño ✦")
    .replace("</head>", `<style>
      body { font-size: 17px; }
      .styles { grid-template-columns: 1fr !important; gap: 9px !important; }
      .style { min-height: 44px; padding: 11px 12px !important; font-size: .9rem !important; text-align: left; }
      .tool { min-height: 54px; font-size: 1rem; }
      .status, .section-title p, .cta p, .hint, .setting { font-size: .92rem !important; }
      .result-title { font-size: 1rem; }
      .action { min-height: 42px; font-size: .9rem; }
      @media (max-width: 720px) { body { font-size: 16px; } .styles { grid-template-columns: repeat(2, 1fr) !important; } }
    </style></head>`)
    .replace("</body>", `<script>
      (() => {
        const auth = document.querySelector('#auth');
        const format = document.querySelector('#format');
        const results = document.querySelector('#results');
        const applyFormat = () => {
          const aspect = format.value.includes('Panorámico') ? '16 / 9' : format.value.includes('Vertical') ? '4 / 5' : '4 / 5';
          results.querySelectorAll('img').forEach((image) => image.style.aspectRatio = aspect);
        };
        format.addEventListener('change', applyFormat);
        new MutationObserver(applyFormat).observe(results, { childList: true });
        fetch('/api/auth/me').then((response) => response.json()).then(({ user }) => {
          if (!user && !auth.open) auth.showModal();
        }).catch(() => {});
      })();
    </script></body>`);
  return new Response(page, { headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "no-store" } });
}
