import { studioPage } from "../ui/studio";

export function studio(): Response {
  const page = studioPage()
    .replace("Generar 2 propuestas ✦", "Generar Diseño ✦")
    .replace("<button class=\"style\">Vintage</button>", "<button class=\"style\">Vintage</button><button class=\"style\">Cinemático</button>")
    .replace("</textarea>", `</textarea><div class="creative-helper"><button class="secondary" id="improve-prompt" type="button">✦ Mejorar mi idea con IA</button><span>La IA estructura tu concepto para una composición artística e imprimible.</span></div><div class="prompt-presets" aria-label="Inspiración de dirección artística"><button type="button" data-inspiration="Cinematic original fantasy ensemble, hyper-realistic expressive faces, battle-ready poses, weathered armor, ruined city at golden dusk, dramatic depth and editorial lighting">⚔ Fantasía épica</button><button type="button" data-inspiration="Hyper-realistic urban hero, neon rain, layered streetwear, confident pose, cinematic cyan and fuchsia rim light, dynamic perspective">✦ Héroe urbano</button><button type="button" data-inspiration="Premium surreal animal mascot, energetic movement, vibrant ink textures, bold organic silhouette, print-ready visual hierarchy">◈ Mascota artística</button></div>`)
    .replace("</head>", `<style>
      body { font-size: 17px; }
      .styles { grid-template-columns: 1fr !important; gap: 9px !important; }
      .style { min-height: 44px; padding: 11px 12px !important; font-size: .9rem !important; text-align: left; }
      .tool { min-height: 54px; font-size: 1rem; }
      .status, .section-title p, .cta p, .hint, .setting { font-size: .92rem !important; }
      .result-title { font-size: 1rem; }
      .action { min-height: 42px; font-size: .9rem; }
      .creative-helper { display:flex; align-items:center; gap:12px; color:#b8d1e7; font-size:.86rem; }
      .creative-helper .secondary { padding:9px 12px; white-space:nowrap; }
      .prompt-presets { display:flex; flex-wrap:wrap; gap:8px; }
      .prompt-presets button { border:1px solid #315d85; border-radius:999px; padding:8px 11px; color:#d9efff; background:#091c36; font-size:.84rem; font-weight:800; }
      .prompt-presets button:hover { border-color:#00d9ff; background:#0c4167; }
      @media (max-width: 720px) { body { font-size: 16px; } .styles { grid-template-columns: repeat(2, 1fr) !important; } .creative-helper { align-items:flex-start; flex-direction:column; } }
    </style></head>`)
    .replace("</body>", `<script>
      (() => {
        const auth = document.querySelector('#auth');
        const format = document.querySelector('#format');
        const results = document.querySelector('#results');
        const improve = document.querySelector('#improve-prompt');
        const prompt = document.querySelector('textarea[name="prompt"]');
        const applyFormat = () => {
          const aspect = format.value.includes('Panorámico') ? '16 / 9' : format.value.includes('Vertical') ? '4 / 5' : '4 / 5';
          results.querySelectorAll('img').forEach((image) => image.style.aspectRatio = aspect);
        };
        format.addEventListener('change', applyFormat);
        new MutationObserver(applyFormat).observe(results, { childList: true });
        document.querySelectorAll('[data-inspiration]').forEach((button) => button.addEventListener('click', () => {
          prompt.value = prompt.value.trim() ? prompt.value.trim() + '. ' + button.dataset.inspiration : button.dataset.inspiration;
          prompt.focus();
          document.querySelector('#status').textContent = 'Dirección creativa añadida. Mejora la idea con IA o genera el diseño.';
        }));
        improve.addEventListener('click', async () => {
          if (!prompt.value.trim()) { prompt.focus(); return; }
          const original = improve.textContent;
          improve.disabled = true;
          improve.textContent = 'Creando dirección artística...';
          try {
            const response = await fetch('/api/prompt-assist', { method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({ prompt:prompt.value, style:document.querySelector('.style.active')?.textContent, format:format.value, product:document.querySelector('#product').value, colors:document.querySelector('#colors').value, creativity:document.querySelector('#creativity').value }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'No fue posible mejorar la idea.');
            prompt.value = data.prompt;
            document.querySelector('#status').textContent = data.assisted ? 'Dirección artística optimizada. Ya puedes generar tu diseño.' : (data.notice || 'Prompt optimizado para impresión.');
          } catch (error) { document.querySelector('#status').textContent = error.message || 'No fue posible mejorar la idea.'; }
          finally { improve.disabled = false; improve.textContent = original; }
        });
        fetch('/api/auth/me').then((response) => response.json()).then(({ user }) => {
          if (!user && !auth.open) auth.showModal();
        }).catch(() => {});
      })();
    </script></body>`);
  return new Response(page, { headers: { "content-type": "text/html; charset=UTF-8", "cache-control": "no-store" } });
}
