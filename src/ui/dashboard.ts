export function dashboardPage(): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#050b1a" />
    <title>PINOLEROS.AI — Diseña sin límites</title>
    <style>
      :root { color-scheme: dark; --bg:#050b1a; --panel:#09172b; --line:#17365c; --text:#f8fbff; --muted:#9fb0c9; --cyan:#00d9ff; --pink:#ff2daa; --yellow:#ffd129; --violet:#7148ff; }
      * { box-sizing:border-box; } html { scroll-behavior:smooth; } body { margin:0; min-width:320px; background:radial-gradient(circle at 70% 0%,#122b55 0,transparent 34rem),var(--bg); color:var(--text); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
      button,input { font:inherit; } button { cursor:pointer; transition:transform .22s ease,filter .22s ease,box-shadow .22s ease,background .22s ease; } button:hover { transform:translateY(-2px); filter:brightness(1.1); } button:focus-visible,input:focus-visible { outline:3px solid var(--cyan); outline-offset:3px; } .app { display:grid; grid-template-columns:210px minmax(0,1fr) 290px; min-height:100vh; gap:16px; padding:16px; animation:fade-in .55s ease both; }
      .sidebar,.rightbar,.hero,.section { border:1px solid var(--line); border-radius:18px; background:linear-gradient(145deg,rgba(10,26,49,.94),rgba(4,13,28,.94)); box-shadow:0 20px 50px rgba(0,0,0,.2); }
      .sidebar { display:flex; flex-direction:column; padding:14px; } .brand { position:relative; height:132px; margin:0 0 14px; overflow:hidden; border:1px solid #276490; border-radius:13px; background:linear-gradient(135deg,#ffffff,#eef8ff); box-shadow:0 10px 24px #0006; font-size:0; } .brand::before { content:""; position:absolute; inset:5px; background:url('/images/pinoleros-brand-full.png') center/contain no-repeat; } .brand::after { content:""; position:absolute; inset:0; pointer-events:none; border-radius:inherit; background:linear-gradient(120deg,transparent 38%,rgba(255,255,255,.7) 50%,transparent 62%); transform:translateX(-120%); animation:brand-sheen 6s ease-in-out infinite; }
      .nav { display:grid; gap:4px; } .nav-title { margin:19px 9px 7px; color:#6f8bac; font-size:.66rem; font-weight:800; letter-spacing:.08em; } .nav button { display:flex; align-items:center; gap:11px; color:#dce7f5; border:0; border-radius:11px; background:transparent; padding:12px; text-align:left; } .nav button:hover,.nav .active { background:linear-gradient(100deg,#142d72,#0669d9); color:white; } .nav-icon { width:20px; text-align:center; color:var(--cyan); }
      .side-cta { margin-top:auto; padding:18px 12px; text-align:center; border:1px solid #2565a8; border-radius:13px; background:linear-gradient(135deg,#0d2245,#111940); color:#ffe273; } .side-cta p { margin:0 0 12px; font-weight:700; } .side-cta button { border:0; border-radius:99px; background:linear-gradient(90deg,#ffcc32,#ffaf32); color:#17213b; font-weight:800; padding:10px 18px; }
      main { min-width:0; } .topbar { display:flex; gap:18px; align-items:center; margin:0 0 12px; } .search { flex:1; display:flex; align-items:center; gap:8px; padding:10px 15px; border:1px solid #2376c6; border-radius:13px; background:#07142b; color:var(--muted); } .search input { width:100%; border:0; outline:0; background:transparent; color:white; } .top-actions { display:flex; gap:8px; align-items:center; } .pill,.icon-button { border:1px solid var(--line); border-radius:10px; background:#09182e; color:white; padding:9px 11px; } .pill { color:#ffdf43; font-weight:700; } .avatar { width:38px; height:38px; display:grid; place-items:center; border-radius:50%; background:linear-gradient(135deg,var(--cyan),var(--pink)); font-weight:900; }
      .hero { position:relative; isolation:isolate; min-height:356px; overflow:hidden; padding:42px; display:flex; align-items:center; background:radial-gradient(circle at 88% 28%,#ed1b9d 0,transparent 15%),radial-gradient(circle at 70% 85%,#02ccea 0,transparent 25%),linear-gradient(112deg,#07152c 0%,#0e1b3b 46%,#221245 100%); } .hero::before { content:""; position:absolute; z-index:-2; inset:0; opacity:.8; background:repeating-linear-gradient(113deg,transparent 0 44px,rgba(0,216,255,.10) 45px 47px,transparent 48px 94px),repeating-linear-gradient(18deg,transparent 0 69px,rgba(255,43,170,.12) 70px 72px,transparent 73px 150px); } .hero::after { content:"✦  ✦  ✦"; position:absolute; right:7%; top:18px; color:var(--yellow); letter-spacing:15px; font-size:.8rem; animation:float 4s ease-in-out infinite; } .hero-content { position:relative; z-index:2; max-width:52%; animation:hero-copy .7s .12s cubic-bezier(.2,.9,.3,1) both; } .hero-art { position:absolute; z-index:1; right:-2%; bottom:-5%; width:min(64%,760px); max-height:114%; object-fit:contain; object-position:right bottom; filter:drop-shadow(0 18px 24px #0009); transform-origin:68% 90%; animation:falcon-float 4.5s ease-in-out infinite; }
      .eyebrow { color:var(--cyan); font-size:.75rem; font-weight:900; letter-spacing:.13em; text-transform:uppercase; } h1 { max-width:570px; margin:8px 0; font-size:clamp(2.15rem,4vw,4.4rem); line-height:.93; letter-spacing:-.065em; text-wrap:balance; } h1 em { color:var(--yellow); font-style:normal; } .hero p { max-width:475px; color:#d6e4f5; line-height:1.5; } .primary { margin-top:12px; border:0; border-radius:999px; padding:13px 22px; font-weight:850; color:white; background:linear-gradient(90deg,#de119d,#6b45ff 55%,#00ccea); box-shadow:0 8px 25px #5f27ae77; animation:pulse 2.8s ease-in-out infinite; }
      .section { margin-top:14px; padding:16px; } .section-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:14px; } h2 { margin:0; font-size:1rem; } .section-heading p { margin:3px 0 0; color:var(--muted); font-size:.78rem; } .link { border:0; color:var(--cyan); background:transparent; white-space:nowrap; }
      .tools { display:grid; grid-template-columns:repeat(5,minmax(135px,1fr)); gap:10px; overflow:auto; } .tool { min-height:125px; border:0; border-radius:11px; padding:16px; color:white; text-align:left; } .tool:hover { box-shadow:0 16px 28px #0006; } .tool strong { display:block; margin:18px 0 6px; } .tool small { color:#eff5ff; } .tool:nth-child(1){background:linear-gradient(135deg,#7525fe,#4130d8)} .tool:nth-child(2){background:linear-gradient(135deg,#0876ff,#00adcf)} .tool:nth-child(3){background:linear-gradient(135deg,#fb0b9d,#bd167e)} .tool:nth-child(4){background:linear-gradient(135deg,#ffd629,#d89e00);color:#252235} .tool:nth-child(5){background:linear-gradient(135deg,#00bf77,#00a954)}
      .styles { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; } .style { position:relative; aspect-ratio:1; display:flex; align-items:end; border:0; padding:9px; border-radius:10px; overflow:hidden; color:white; font-size:.75rem; font-weight:800; text-align:left; background-image:linear-gradient(transparent 45%,rgba(0,0,0,.86)),url('/images/style-collection.png'); background-size:100% 100%,300% 200%; background-position:0 0,0 0; } .style::after { content:"→"; position:absolute; right:8px; bottom:7px; opacity:0; transform:translateX(-6px); transition:.2s; } .style:hover::after { opacity:1; transform:none; } .style:nth-child(2){background-position:0 0,50% 0}.style:nth-child(3){background-position:0 0,100% 0}.style:nth-child(4){background-position:0 0,0 100%}.style:nth-child(5){background-position:0 0,50% 100%}.style:nth-child(6){background-position:0 0,100% 100%}.inspiration { display:grid; grid-template-columns:repeat(6,1fr); gap:9px; } .inspiration-card { aspect-ratio:1.42; border:1px solid #26527a; border-radius:8px; background-image:url('/images/style-collection.png'); background-size:300% 200%; background-position:0 0; transition:transform .28s ease,box-shadow .28s ease; } .inspiration-card:hover { transform:translateY(-5px) rotate(-1deg); box-shadow:0 15px 25px #0008; } .inspiration-card:nth-child(2){background-position:50% 0}.inspiration-card:nth-child(3){background-position:100% 0}.inspiration-card:nth-child(4){background-position:0 100%}.inspiration-card:nth-child(5){background-position:50% 100%}.inspiration-card:nth-child(6){background-position:100% 100%}
      .rightbar { align-self:start; padding:14px; } .rightbar + .rightbar { margin-top:-2px; } .recent { display:grid; gap:11px; } .recent-item { display:flex; align-items:center; gap:10px; } .thumb { width:43px; height:43px; flex:0 0 auto; border-radius:8px; background:linear-gradient(135deg,#eb2db3,#3529c2,#00d1ee); } .recent-item:nth-child(2) .thumb { background:linear-gradient(135deg,#00d8e7,#2652cc,#ffcc23); } .recent-item:nth-child(3) .thumb { background:linear-gradient(135deg,#fdce33,#bb6422,#42251a); } .recent-item b { display:block; font-size:.82rem; } .recent-item span { color:var(--muted); font-size:.72rem; } .trend-list { display:flex; flex-wrap:wrap; gap:7px; } .trend { border:1px solid #275078; border-radius:99px; padding:6px 9px; color:#c6d9f3; font-size:.72rem; }
      .print-card { margin-top:14px; padding:18px; border-radius:14px; background:radial-gradient(circle at 90% 10%,#67efb3 0,transparent 30%),linear-gradient(135deg,#170e5b,#075c8b); } .print-card h3 { margin:0; font-size:1.15rem; } .print-card p { color:#d3e8fb; font-size:.8rem; line-height:1.5; } .print-card button { border:0; border-radius:99px; background:linear-gradient(90deg,#7918ec,#01cde7); color:white; padding:10px 15px; font-weight:750; }
      .help-card { margin-top:14px; display:flex; align-items:center; gap:10px; border:1px solid #1e5382; border-radius:12px; padding:11px; background:#07172f; } .help-orb { display:grid; place-items:center; width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--cyan),var(--violet)); } .help-card b,.help-card span { display:block; font-size:.72rem; } .help-card span { color:var(--muted); } .chat { margin-left:auto; border:0; border-radius:99px; padding:7px 10px; color:#ff8ddb; background:#34134a; font-size:.7rem; } dialog { width:min(480px,calc(100% - 32px)); border:1px solid #2a78b5; border-radius:20px; color:white; background:#09182e; box-shadow:0 30px 90px #000c; } dialog::backdrop { background:#020713b9; backdrop-filter:blur(5px); } .studio-form { display:grid; gap:13px; } .studio-form h2 { font-size:1.4rem; } .studio-form label { display:grid; gap:6px; color:#c9d8ed; font-size:.82rem; } .studio-form input,.studio-form textarea { border:1px solid #315578; border-radius:9px; padding:11px; color:white; background:#061225; } .studio-form textarea { min-height:90px; resize:vertical; } .form-actions { display:flex; justify-content:flex-end; gap:8px; } .secondary { border:1px solid #315578; border-radius:99px; padding:10px 16px; color:white; background:transparent; } .status { min-height:18px; color:var(--cyan); font-size:.8rem; } @keyframes fade-in { from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none} } @keyframes hero-copy { from{opacity:0;transform:translateX(-22px)}to{opacity:1;transform:none} } @keyframes falcon-float { 0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-9px) rotate(-.7deg)} } @keyframes float { 50%{transform:translateY(10px)} } @keyframes pulse { 50%{box-shadow:0 8px 34px #00cceaaa} } @media (prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}} .mobile-nav { display:none; } @media (max-width:1100px){.app{grid-template-columns:190px minmax(0,1fr)}.right-column{display:none}.tools{grid-template-columns:repeat(3,minmax(145px,1fr))}.styles,.inspiration{grid-template-columns:repeat(4,1fr)}} @media (max-width:720px){.app{display:block;padding:10px}.sidebar{display:none}.topbar{gap:8px}.pill{display:none}.top-actions .icon-button:first-child{display:none}.hero{min-height:330px;padding:28px 22px}.hero-content{max-width:72%}.hero-art{width:93%;right:-26%;opacity:.78}.hero::after{opacity:.55;right:-4px}.tools{grid-template-columns:repeat(2,minmax(135px,1fr))}.styles,.inspiration{grid-template-columns:repeat(3,1fr)}.mobile-nav{position:sticky;bottom:8px;z-index:2;display:flex;justify-content:space-around;margin-top:10px;padding:9px;border:1px solid var(--line);border-radius:15px;background:#08172ddd}.mobile-nav button{border:0;background:transparent;color:#dbeafa;font-size:.72rem}.mobile-nav button:first-child{color:var(--cyan)}}
    </style>
    <style>
      .hero h1 { margin:10px 0 12px; width:max-content; max-width:100%; font-family:Impact,Haettenschweiler,"Arial Narrow Bold",sans-serif; font-size:0; font-style:italic; font-weight:900; line-height:.77; letter-spacing:-.055em; text-transform:uppercase; transform:rotate(-4deg) skewX(-7deg); text-shadow:3px 4px 0 rgba(1,15,34,.86),0 0 18px rgba(0,218,255,.22); }
      .hero h1::before { content:"TU IMAGINACIÓN\A NO TIENE LÍMITES"; white-space:pre; display:block; font-size:clamp(2.65rem,4.9vw,5.3rem); background:linear-gradient(120deg,#fff 0 42%,#00d9ff 49%,#fff 56% 100%); background-size:240% 100%; -webkit-background-clip:text; background-clip:text; color:transparent; animation:title-reveal .8s cubic-bezier(.18,.9,.24,1) both,title-shine 4s 1.1s linear infinite; }
      .hero h1::after { content:""; display:block; width:96%; height:5px; margin-top:9px; border-radius:99px; background:linear-gradient(90deg,transparent,#00d9ff 14% 88%,transparent); transform:scaleX(0); transform-origin:left; animation:underline .55s .88s ease-out both; }
      .hero h1 .hero-word { display:block; position:relative; width:max-content; max-width:100%; animation:brush-in .72s cubic-bezier(.18,.9,.24,1) both; }
      .hero h1 .hero-word:first-child { color:#fff; animation-delay:.1s; }
      .hero h1 .hero-word:last-child { color:#ffd21f; animation-delay:.34s; }
      .hero h1 .hero-word::after { content:""; position:absolute; left:2%; right:-7%; bottom:-7px; height:5px; border-radius:99px; background:linear-gradient(90deg,transparent,#00d9ff 14% 88%,transparent); transform:scaleX(0); transform-origin:left; animation:underline .55s .88s ease-out both; }
      @keyframes brush-in { from { opacity:0; clip-path:inset(0 100% 0 0); transform:translateX(-20px) skewX(-18deg); } to { opacity:1; clip-path:inset(0 0 0 0); transform:none; } }
      @keyframes underline { to { transform:scaleX(1); } }
      @keyframes title-reveal { from { opacity:0; clip-path:inset(0 100% 0 0); transform:translateX(-20px) skewX(-18deg); } to { opacity:1; clip-path:inset(0 0 0 0); transform:none; } }
      @keyframes title-shine { to { background-position:-240% 0; } }
      @keyframes brand-sheen { 0%,72% { transform:translateX(-120%); } 100% { transform:translateX(120%); } }
      @media (prefers-reduced-motion:reduce) { .hero h1 .hero-word,.hero h1 .hero-word::after { animation:none; } }
    </style>
    <style>
      /* Hero aligned to the original visual proposal: mural city, subject at right, copy at left. */
      .hero { background-image:linear-gradient(90deg,rgba(4,12,28,.92) 3%,rgba(4,12,28,.58) 47%,rgba(4,12,28,.05) 80%),url('/images/pinoleros-hero.png') !important; background-size:cover !important; background-position:center !important; }
      .hero::before { opacity:.28; } .hero-art { display:none; }
      .hero h1::before { content:"TU IMAGINACIÓN"; color:#fff; background:none; -webkit-background-clip:initial; background-clip:initial; }
      .hero h1::after { content:"NO TIENE LÍMITES"; display:block; width:auto; height:auto; margin:0; border-radius:0; background:none; color:#ffd21f; font-size:clamp(2.65rem,4.9vw,5.3rem); line-height:.8; transform:none; animation:brush-in .72s .3s cubic-bezier(.18,.9,.24,1) both; }
    </style>
    <style>
      /* Exact hero artwork supplied in the approved original concept. */
      .hero { min-height:0; aspect-ratio:1001/357; padding:0; background-image:url('/images/pinoleros-reference-hero.png') !important; background-size:103% 103% !important; background-position:center; animation:hero-art-drift 8s ease-in-out infinite alternate; }
      .hero::before,.hero::after,.hero-art { display:none !important; }
      .hero-content { position:absolute; left:4%; top:53%; width:25%; height:16%; max-width:none; opacity:0; animation:none; }
      .hero-content .primary { width:100%; height:100%; margin:0; }
      @keyframes hero-art-drift { from { background-position:49% 49%; } to { background-position:51% 51%; } }
      @media (prefers-reduced-motion:reduce) { .hero { animation:none; } }
    </style>
    <style>
      .hero { aspect-ratio:auto; min-height:356px; background:#07152c !important; overflow:hidden; }
      .hero .hero-content { display:none; }
      .hero-slides { position:absolute; inset:0; } .hero-slide { position:absolute; inset:0; display:flex; align-items:center; padding:40px; opacity:0; transform:scale(1.04); pointer-events:none; transition:opacity .75s ease,transform 1.1s ease; background-size:cover; background-position:center; } .hero-slide.active { opacity:1; transform:none; pointer-events:auto; }
      .hero-slide::before { content:""; position:absolute; inset:0; background:linear-gradient(90deg,rgba(3,11,27,.94),rgba(4,13,31,.65) 42%,rgba(3,11,27,.05) 75%); } .hero-slide[data-slide="0"] { background-image:url('/images/pinoleros-reference-hero.png'); } .hero-slide[data-slide="1"] { background-image:url('/images/pinoleros-hero.png'); } .hero-slide[data-slide="2"] { background-image:radial-gradient(circle at 75% 20%,#e718a0 0,transparent 23%),radial-gradient(circle at 70% 85%,#00cbed 0,transparent 27%),linear-gradient(125deg,#07142d,#1d0d46); } .hero-slide[data-slide="2"]::after { content:""; position:absolute; inset:0 0 0 38%; background:url('/images/pinoleros-falcon-pointing.png') right bottom/contain no-repeat; filter:drop-shadow(0 16px 25px #0009); animation:slide-falcon 4s ease-in-out infinite; }
      .slide-copy { position:relative; z-index:2; max-width:48%; } .slide-kicker { color:#00d9ff; font-weight:900; letter-spacing:.12em; font-size:.72rem; } .slide-copy h1 { margin:9px 0 14px; font-family:Impact,Haettenschweiler,"Arial Narrow Bold",sans-serif; font-style:italic; font-size:clamp(2.5rem,4.7vw,5rem); line-height:.82; letter-spacing:-.04em; text-transform:uppercase; color:#fff; } .slide-copy h1 b { display:block; color:#ffd21f; } .slide-copy p { max-width:420px; line-height:1.45; color:#e3edf8; } .slide-actions { display:flex; gap:10px; margin-top:16px; } .slide-actions button { border:0; border-radius:999px; padding:13px 19px; color:white; font-weight:850; } .start { background:linear-gradient(90deg,#dd119c,#6948ff 54%,#00d1ef); box-shadow:0 8px 24px #571abb99; animation:cta-pulse 2.5s ease-in-out infinite; } .print { background:linear-gradient(90deg,#ffbd25,#ffdb53); color:#18223b !important; box-shadow:0 8px 22px #ffce3377; } .slide-dots { position:absolute; z-index:4; bottom:14px; left:50%; display:flex; gap:7px; transform:translateX(-50%); } .slide-dots button { width:8px; height:8px; border:0; border-radius:99px; padding:0; background:#e6ecf799; } .slide-dots button.active { width:26px; background:#fff; } @keyframes slide-falcon { 50% { transform:translateY(-9px) rotate(-1deg); } } @keyframes cta-pulse { 50% { transform:translateY(-2px) scale(1.035); box-shadow:0 12px 34px #00d9ff88; } } @media (max-width:720px){.hero{min-height:315px}.hero-slide{padding:27px 22px}.slide-copy{max-width:74%}.slide-copy h1{font-size:2.6rem}.hero-slide[data-slide="2"]::after{inset:0 -28% 0 25%;opacity:.7}.slide-actions button{padding:11px 13px;font-size:.79rem}}
    </style>
    <style>
      /* Preserve all approved copy while giving each hero slide safe visual breathing room. */
      .hero { min-height:440px; border-radius:18px; }
      .hero-slide { padding:42px 42px 74px; background-repeat:no-repeat; }
      .hero-slide[data-slide="0"] { background-size:100% 100%; background-position:center; }
      .hero-slide[data-slide="1"] { background-size:contain; background-position:right center; background-color:#07152c; }
      .hero-slide[data-slide="2"]::after { inset:2% -2% 2% 36%; background-size:contain; }
      .slide-copy { max-width:46%; } .slide-actions { position:relative; z-index:3; padding-bottom:2px; }
      .slide-dots { bottom:20px; } .primary,.slide-actions .start { min-height:48px; }
      @media (max-width:1100px) { .hero { min-height:400px; } .slide-copy { max-width:55%; } }
      @media (max-width:720px) { .hero { min-height:365px; } .hero-slide { padding:28px 22px 70px; } .slide-copy { max-width:76%; } .hero-slide[data-slide="0"] { background-size:auto 100%; background-position:center; } }
    </style>
    <style>
      .hero-slide[data-slide="1"]::before,.hero-slide[data-slide="2"]::before { background:linear-gradient(90deg,rgba(3,10,26,.94),rgba(3,10,26,.61) 44%,rgba(3,10,26,.06) 77%),repeating-linear-gradient(116deg,transparent 0 48px,rgba(0,215,255,.17) 49px 53px,transparent 54px 105px),repeating-linear-gradient(19deg,transparent 0 73px,rgba(255,35,169,.14) 74px 78px,transparent 79px 152px); }
      .hero-slide[data-slide="2"] { background-image:radial-gradient(circle at 92% 10%,#fdce24 0,transparent 13%),radial-gradient(circle at 67% 75%,#00d9ff 0,transparent 29%),repeating-linear-gradient(142deg,#101c46 0 26px,#21114c 27px 52px,#0d2952 53px 78px); }
    </style>
    <style>
      /* Every slide preserves the approved hero artwork, including the exact artistic lettering. */
      .hero-slide[data-slide="0"],.hero-slide[data-slide="1"],.hero-slide[data-slide="2"] { background-image:url('/images/pinoleros-reference-hero.png') !important; background-size:100% 100% !important; background-position:center !important; }
      .hero-slide[data-slide="1"] { filter:saturate(1.08) brightness(1.04); } .hero-slide[data-slide="2"] { filter:saturate(1.14) contrast(1.04); }
      .hero-slide::before,.hero-slide[data-slide="2"]::after { display:none !important; }
      .hero-slide .slide-copy { display:none; }
      .hero-slide.active { animation:approved-hero-motion 6.5s ease-in-out both; }
      .hero-slides::after { content:""; position:absolute; inset:0; pointer-events:none; background:linear-gradient(108deg,transparent 34%,rgba(255,255,255,.18) 48%,transparent 62%); transform:translateX(-130%); animation:hero-light-pass 6.5s ease-in-out infinite; mix-blend-mode:screen; }
      @keyframes approved-hero-motion { 0% { opacity:0; transform:scale(.985); } 16%,84% { opacity:1; transform:scale(1); } 100% { opacity:0; transform:scale(1.008); } }
      @keyframes hero-light-pass { 0%,30% { transform:translateX(-130%); } 66%,100% { transform:translateX(130%); } }
      @media (prefers-reduced-motion:reduce) { .hero-slide.active,.hero-slides::after { animation:none; } }
    </style>
    <style>
      /* Distinct bird poses while keeping a consistent, readable campaign system. */
      .hero-slide[data-slide="0"] { background-image:url('/images/pinoleros-reference-hero.png') !important; }
      .hero-slide[data-slide="1"] { background-image:url('/images/pinoleros-hero-print.png') !important; filter:none; }
      .hero-slide[data-slide="2"] { background-image:url('/images/pinoleros-hero.png') !important; filter:none; }
      .hero-slide[data-slide="1"]::before,.hero-slide[data-slide="2"]::before { display:block !important; background:linear-gradient(90deg,rgba(3,10,26,.94),rgba(3,10,26,.72) 43%,rgba(3,10,26,.08) 76%) !important; }
      .hero-slide[data-slide="1"] .slide-copy,.hero-slide[data-slide="2"] .slide-copy { display:block; text-shadow:0 3px 12px #000; }
      .hero-slide[data-slide="0"] .slide-copy { display:block; max-width:42%; } .hero-slide[data-slide="0"] .slide-copy>*:not(.slide-actions) { display:none; }
      .hero-slide .slide-actions { gap:12px; } .hero-slide .start,.hero-slide .print { min-width:170px; } .hero-slide .print { position:relative; overflow:hidden; }
      .hero-slide .print::after { content:""; position:absolute; inset:0; background:linear-gradient(105deg,transparent 30%,rgba(255,255,255,.68) 50%,transparent 70%); transform:translateX(-115%); animation:print-sheen 3.4s ease-in-out infinite; }
      @keyframes print-sheen { 60%,100% { transform:translateX(115%); } }
    </style>
    <style>
      /* Clean imagery, with copy and actions kept as responsive interactive layers. */
      .hero-slide[data-slide="0"] { background-image:url('/images/pinoleros-hero.png') !important; }
      .hero-slide[data-slide="0"] .slide-copy { display:block; max-width:46%; text-shadow:0 3px 12px #000; }
      .hero-slide[data-slide="0"] .slide-copy>*:not(.slide-actions) { display:block; }
      .hero-slide .slide-copy { padding-top:44px; }
      .hero-slide .slide-actions { position:absolute; z-index:4; top:22px; right:26px; margin:0; padding:0; display:flex; gap:10px; }
      .hero-slide .start,.hero-slide .print { min-width:0; white-space:nowrap; padding:11px 16px; font-size:.86rem; }
      @media (max-width:720px) { .hero { min-height:390px; } .hero-slide { background-size:auto 100% !important; background-position:center !important; } .hero-slide .slide-copy { max-width:82% !important; padding-top:62px; } .hero-slide .slide-actions { left:18px; right:auto; top:14px; gap:7px; } .hero-slide .start,.hero-slide .print { padding:9px 11px; font-size:.73rem; } .slide-copy h1 { font-size:clamp(2.1rem,11vw,3.2rem); } }
    </style>
    <style>
      /* Approved campaign lettering is supplied artwork: identical in every slide. */
      .hero { min-height:440px; background:#061426 !important; }
      .hero-slide,
      .hero-slide[data-slide="0"],
      .hero-slide[data-slide="1"],
      .hero-slide[data-slide="2"] {
        background-color:#061426 !important;
        background-repeat:no-repeat !important;
        background-size:contain !important;
        background-position:right center !important;
      }
      .hero-slide[data-slide="0"] { background-image:url('/images/pinoleros-hero.png') !important; }
      .hero-slide[data-slide="1"] { background-image:url('/images/pinoleros-hero-print.png') !important; }
      .hero-slide[data-slide="2"] { background-image:url('/images/pinoleros-falcon-pointing.png') !important; }
      .hero-slide::before,
      .hero-slide[data-slide="2"]::after { display:none !important; }
      .hero-slide .slide-copy {
        position:absolute !important;
        inset:0 !important;
        z-index:3 !important;
        display:block !important;
        max-width:none !important;
        padding:0 !important;
        text-shadow:none !important;
      }
      .hero-slide .slide-copy > :not(.slide-actions) {
        position:absolute !important;
        width:1px !important;
        height:1px !important;
        padding:0 !important;
        margin:-1px !important;
        overflow:hidden !important;
        clip:rect(0,0,0,0) !important;
        white-space:nowrap !important;
        border:0 !important;
      }
      .hero-slide .slide-copy::before {
        content:"";
        position:absolute;
        top:30px;
        left:40px;
        width:min(430px,45%);
        aspect-ratio:430 / 214;
        background:url('/images/pinoleros-hero-copy.png') left top / contain no-repeat;
        filter:drop-shadow(0 5px 12px rgba(0,0,0,.34));
        animation:copy-settle .8s cubic-bezier(.18,.9,.24,1) both;
      }
      .hero-slide .slide-actions {
        position:absolute !important;
        z-index:4 !important;
        top:auto !important;
        right:auto !important;
        bottom:36px !important;
        left:40px !important;
        display:flex !important;
        gap:12px !important;
        margin:0 !important;
        padding:0 !important;
      }
      .hero-slide .start,
      .hero-slide .print {
        min-width:0 !important;
        padding:13px 20px !important;
        font-size:.9rem !important;
      }
      .slide-dots { bottom:17px !important; }
      @keyframes copy-settle { from { opacity:0; transform:translateX(-16px); } to { opacity:1; transform:none; } }
      @media (max-width:1100px) {
        .hero { min-height:400px; }
        .hero-slide .slide-copy::before { left:30px; top:27px; width:min(430px,50%); }
        .hero-slide .slide-actions { left:30px !important; bottom:31px !important; }
      }
      @media (max-width:720px) {
        .hero { min-height:390px; }
        .hero-slide,
        .hero-slide[data-slide="0"],
        .hero-slide[data-slide="1"],
        .hero-slide[data-slide="2"] { background-size:auto 75% !important; background-position:right bottom !important; }
        .hero-slide .slide-copy::before { top:22px; left:18px; width:min(430px,88vw); }
        .hero-slide .slide-actions { left:18px !important; bottom:36px !important; gap:8px !important; }
        .hero-slide .start,.hero-slide .print { padding:10px 12px !important; font-size:.74rem !important; }
        .slide-dots { bottom:14px !important; }
      }
      @media (prefers-reduced-motion:reduce) { .hero-slide .slide-copy::before { animation:none; } }
    </style>
    <style>
      /* The slideshow is the approved wide hero artwork, shown whole—not cropped or redrawn. */
      .hero {
        min-height:0 !important;
        aspect-ratio:1001 / 357 !important;
        background:#061426 !important;
      }
      .hero-slide,
      .hero-slide[data-slide="0"],
      .hero-slide[data-slide="1"],
      .hero-slide[data-slide="2"] {
        background-image:url('/images/pinoleros-reference-hero.png') !important;
        background-size:100% 100% !important;
        background-position:center !important;
        background-repeat:no-repeat !important;
        filter:none !important;
      }
      .hero-slide.active { animation:none !important; transform:none !important; }
      .hero-slides::after { display:none !important; }
      /* Typography and the visible CTA remain the exact artwork from the supplied original. */
      .hero-slide .slide-copy::before { display:none !important; }
      .hero-slide .slide-actions {
        top:70.5% !important;
        right:auto !important;
        bottom:auto !important;
        left:3.8% !important;
        width:20.8% !important;
        height:14.5% !important;
        display:block !important;
      }
      .hero-slide .start {
        width:100% !important;
        height:100% !important;
        min-height:0 !important;
        padding:0 !important;
        opacity:0 !important;
      }
      .hero-slide .print { display:none !important; }
      .slide-dots { bottom:3.5% !important; }
      @media (max-width:720px) {
        .hero { aspect-ratio:1001 / 357 !important; }
        .hero-slide .slide-actions { left:3.8% !important; top:70.5% !important; }
        .slide-dots { display:none !important; }
      }
    </style>
    <style>
      /* Only the mascot moves between slides; the approved wide artwork stays intact. */
      .hero-slide[data-slide="1"]::after,
      .hero-slide[data-slide="2"]::after {
        content:"" !important;
        display:block !important;
        position:absolute !important;
        z-index:2 !important;
        pointer-events:none !important;
        background:url('/images/pinoleros-hero-mascot-overlay.png') center / contain no-repeat !important;
        filter:drop-shadow(0 12px 16px rgba(0,0,0,.32)) !important;
        animation:mascot-float 4.8s ease-in-out infinite !important;
      }
      .hero-slide[data-slide="1"]::after { width:43% !important; height:96% !important; right:7% !important; bottom:-4% !important; inset:auto 7% -4% auto !important; }
      .hero-slide[data-slide="2"]::after { width:39% !important; height:88% !important; right:1% !important; bottom:1% !important; inset:auto 1% 1% auto !important; transform:scaleX(-1) rotate(-3deg) !important; animation-delay:-1.6s !important; }
      @keyframes mascot-float { 0%,100% { margin-bottom:0; } 50% { margin-bottom:8px; } }
      @media (max-width:720px) {
        .hero-slide[data-slide="1"]::after { width:42% !important; height:94% !important; right:3% !important; }
        .hero-slide[data-slide="2"]::after { width:38% !important; height:84% !important; right:0 !important; }
      }
      @media (prefers-reduced-motion:reduce) { .hero-slide[data-slide="1"]::after,.hero-slide[data-slide="2"]::after { animation:none !important; } }
    </style>
    <style>
      /* Foreground CTAs remain interactive above every original hero frame. */
      .hero-slide .slide-actions {
        z-index:6 !important;
        display:flex !important;
        align-items:stretch !important;
        width:auto !important;
        height:14.5% !important;
        gap:1.05% !important;
      }
      .hero-slide .start,
      .hero-slide .print {
        display:block !important;
        height:100% !important;
        min-height:0 !important;
        padding:0 17px !important;
        opacity:1 !important;
        white-space:nowrap !important;
        font-size:clamp(.58rem,1.15vw,.92rem) !important;
        line-height:1 !important;
      }
      .hero-slide .start { width:20.8vw !important; max-width:208px !important; }
      .hero-slide .print { width:14.2vw !important; max-width:142px !important; }
      @media (max-width:720px) {
        .hero-slide .slide-actions { gap:1.2% !important; }
        .hero-slide .start { width:20.8vw !important; padding:0 6px !important; }
        .hero-slide .print { width:14.2vw !important; padding:0 5px !important; }
      }
    </style>
    <style>
      /* User-provided campaign frames: full bleed at their native panoramic proportion. */
      .hero { aspect-ratio:2170 / 725 !important; }
      .hero-slide[data-slide="0"] { background-image:url('/images/hero-1.png') !important; }
      .hero-slide[data-slide="1"] { background-image:url('/images/hero-2.png') !important; }
      .hero-slide[data-slide="2"] { background-image:url('/images/hero-3.png') !important; }
      .hero-slide,
      .hero-slide[data-slide="0"],
      .hero-slide[data-slide="1"],
      .hero-slide[data-slide="2"] { background-size:100% 100% !important; background-position:center !important; }
      .hero-slide[data-slide="1"]::after,.hero-slide[data-slide="2"]::after { display:none !important; }
      .hero-slide.active { animation:hero-frame-enter .7s ease both !important; }
      .hero-slides::after { display:block !important; z-index:5; animation:hero-light-pass 6.5s ease-in-out infinite !important; }
      .hero-slide .slide-actions { left:4.1% !important; top:auto !important; bottom:8.4% !important; width:auto !important; height:auto !important; gap:12px !important; }
      .hero-slide .start,.hero-slide .print { width:auto !important; max-width:none !important; height:48px !important; padding:0 22px !important; font-size:.92rem !important; border:1px solid rgba(255,255,255,.38) !important; }
      .hero-slide .start { background:linear-gradient(95deg,#e9149f,#7548ff 53%,#00d6e9) !important; box-shadow:0 10px 28px rgba(63,22,175,.62) !important; }
      .hero-slide .print { background:linear-gradient(95deg,#ffad22,#ffe05b) !important; box-shadow:0 10px 28px rgba(255,185,38,.42) !important; }
      .personal-space { width:min(960px,calc(100% - 32px)); max-height:85vh; padding:24px; overflow:auto; }
      .personal-space form { float:right; } .personal-space h2 { font-size:1.5rem; } .personal-space p { color:var(--muted); }
      .personal-space .results { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:14px; }
      .personal-space .result { display:grid; gap:8px; text-align:left; border:1px solid #29547c; border-radius:12px; padding:9px; overflow:hidden; background:#06152c; }
      .personal-space .result img { width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; } .print-design { border:0; border-radius:999px; padding:9px; color:#17213b; font-weight:800; background:linear-gradient(90deg,#ffbc28,#ffe15a); }
      @keyframes hero-frame-enter { from { opacity:0; transform:scale(.985); } to { opacity:1; transform:scale(1); } }
      @media (max-width:720px) {
        .hero { aspect-ratio:auto !important; min-height:215px !important; }
        .hero-slide,.hero-slide[data-slide="0"],.hero-slide[data-slide="1"],.hero-slide[data-slide="2"] { background-size:100% auto !important; background-position:center top !important; }
        .hero-slide .slide-actions { left:50% !important; bottom:18px !important; transform:translateX(-50%); justify-content:center; width:max-content !important; gap:10px !important; }
        .hero-slide .start,.hero-slide .print { height:49px !important; padding:0 17px !important; font-size:.86rem !important; }
      }
      @media (prefers-reduced-motion:reduce) { .hero-slide.active,.hero-slides::after { animation:none !important; } }
    </style>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@700;800;900&display=swap');
      /* No dark veil over the supplied campaign frames; retain only the mirror sheen. */
      .hero-slide::before,
      .hero-slide[data-slide="1"]::before,
      .hero-slide[data-slide="2"]::before { display:none !important; background:none !important; }
      .hero-slide .slide-actions { gap:14px !important; }
      .hero-slide .start,.hero-slide .print {
        height:56px !important;
        padding:0 29px !important;
        font-family:Roboto,Arial,sans-serif !important;
        font-size:1.02rem !important;
        font-weight:900 !important;
        letter-spacing:.015em !important;
        text-transform:uppercase;
      }
      .hero-slide .start { box-shadow:0 12px 30px rgba(63,22,175,.7),inset 0 1px 0 rgba(255,255,255,.35) !important; }
      .hero-slide .print { box-shadow:0 12px 30px rgba(255,185,38,.55),inset 0 1px 0 rgba(255,255,255,.55) !important; }
      @media (max-width:720px) {
        .hero-slide .slide-actions { gap:12px !important; }
        .hero-slide .start,.hero-slide .print { height:58px !important; padding:0 22px !important; font-size:1rem !important; }
      }
    </style>
    <style>
      /* Floating creative navigation: stays available while the creator explores. */
      .sidebar {
        position:sticky;
        top:16px;
        align-self:start;
        height:calc(100vh - 32px);
        max-height:850px;
        overflow:auto;
        scrollbar-width:none;
        border-color:#245b91;
        background:linear-gradient(165deg,rgba(9,27,53,.98),rgba(3,13,29,.96));
        box-shadow:0 24px 55px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.06);
        animation:floating-menu 6s ease-in-out infinite;
      }
      .sidebar::-webkit-scrollbar { display:none; }
      .brand { height:112px; margin-bottom:10px; }
      .nav { gap:7px; }
      .nav-title { margin:12px 8px 3px; color:#7ba5ca; }
      .nav button {
        min-height:55px;
        padding:9px 10px;
        border:1px solid transparent;
        border-radius:13px;
        align-items:center;
      }
      .nav button > span:last-child { display:grid; gap:2px; }
      .nav button b { color:inherit; font-size:.83rem; line-height:1; }
      .nav button small { color:#8fa9c6; font-size:.64rem; line-height:1.1; }
      .nav button:hover,.nav .active { border-color:#2788dd; background:linear-gradient(100deg,rgba(35,60,145,.95),rgba(3,119,218,.93)); box-shadow:0 9px 22px rgba(0,136,244,.22); }
      .nav button:hover small,.nav .active small { color:#dceeff; }
      .nav-icon { display:grid; place-items:center; flex:0 0 30px; width:30px; height:30px; border-radius:10px; color:#64eaff; background:rgba(0,205,242,.10); font-weight:900; }
      .nav .active .nav-icon { color:#fff; background:linear-gradient(135deg,#d915a0,#00d9f3); }
      .nav-account { margin-top:3px; border-color:rgba(255,202,47,.38) !important; background:linear-gradient(105deg,rgba(97,33,117,.42),rgba(8,65,100,.42)); }
      .nav-account .nav-icon { color:#ffdc48; background:rgba(255,201,35,.12); }
      .side-cta { margin-top:14px; padding:14px 10px; }
      @keyframes floating-menu { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
      @media (max-width:1100px) { .sidebar { height:calc(100vh - 32px); } .nav button small { display:none; } .nav button { min-height:48px; } }
      @media (max-width:720px) { .sidebar { animation:none; } }
      @media (prefers-reduced-motion:reduce) { .sidebar { animation:none; } }
    </style>
  </head>
  <body>
    <div class="app">
      <aside class="sidebar"><div class="brand"><span class="brand-mark"></span><span>PINOLEROS.<b>AI</b></span></div><nav class="nav" aria-label="Navegación principal"><p class="nav-title">CREA SIN LÍMITES</p><button class="active"><span class="nav-icon">✦</span><span><b>Diseña</b><small>Tu lienzo creativo</small></span></button><button><span class="nav-icon">◈</span><span><b>Personaliza</b><small>Hazlo a tu manera</small></span></button><button><span class="nav-icon">▣</span><span><b>Imprime</b><small>Tu espacio y pedidos</small></span></button><p class="nav-title">EXPLORA</p><button><span class="nav-icon">◇</span><span><b>Categorías</b><small>Estilos que inspiran</small></span></button><button><span class="nav-icon">AI</span><span><b>Herramientas IA</b><small>Ideas en segundos</small></span></button><button class="nav-account"><span class="nav-icon">◉</span><span><b>Regístrate / Login</b><small>Guarda tus creaciones</small></span></button></nav><div class="side-cta"><p>Convierte tus ideas<br>en productos reales</p><button data-print>Ver servicios →</button></div></aside>
      <main><header class="topbar"><label class="search">⌕ <input aria-label="Buscar" placeholder="Busca ideas, estilos, objetos, tendencias..." /></label><div class="top-actions"><button class="pill">♛ Premium</button><button class="icon-button" aria-label="Notificaciones">♧</button><span class="avatar">WM</span></div></header><section class="hero"><img class="hero-art" src="/images/pinoleros-falcon-pointing.png" alt="Halcón creativo de PINOLEROS apuntando al mensaje" /><div class="hero-content"><div class="eyebrow">Tu estudio creativo con IA</div><h1>Tu imaginación<br><em>no tiene límites</em></h1><p>Crea diseños únicos con nuestra IA, personaliza, combina, vence tendencias y lleva tus ideas a la impresión.</p><button class="primary" data-open-studio>Comenzar a Diseñar&nbsp; →</button></div></section><section class="section"><div class="section-heading"><div><h2>Herramientas de IA</h2><p>Todo lo que necesitas para crear diseños increíbles</p></div><button class="link">Ver todas →</button></div><div class="tools"><button class="tool" data-open-studio>✦<strong>Generador IA</strong><small>Texto a imagen, imagen a imagen y más.</small></button><button class="tool">▣<strong>Composición Inteligente</strong><small>Fusiona, edita y crea composiciones.</small></button><button class="tool">↗<strong>Trend Intelligence</strong><small>Detecta tendencias e ideas virales.</small></button><button class="tool">▤<strong>Print Ready</strong><small>Archivos optimizados para sublimación, DTF y más.</small></button><button class="tool">☁<strong>Sube tu imagen</strong><small>Combínala con nuestra IA y crea algo único.</small></button></div></section><section class="section"><div class="section-heading"><div><h2>Estilos populares</h2><p>Explora los estilos más usados</p></div><button class="link">Ver todos →</button></div><div class="styles"><button class="style" data-open-studio>Urbano</button><button class="style" data-open-studio>Anime</button><button class="style" data-open-studio>3D</button><button class="style" data-open-studio>Graffiti</button><button class="style" data-open-studio>Realista</button><button class="style" data-open-studio>Vintage</button></div></section><section class="section"><div class="section-heading"><div><h2>Inspiración para tus Diseños</h2><p>Descubre lo que está en tendencia y conviértelo en tu próximo diseño</p></div><button class="link">Ver →</button></div><div class="inspiration"><button class="inspiration-card" aria-label="Inspiración urbana"></button><button class="inspiration-card" aria-label="Inspiración anime"></button><button class="inspiration-card" aria-label="Inspiración 3D"></button><button class="inspiration-card" aria-label="Inspiración graffiti"></button><button class="inspiration-card" aria-label="Inspiración realista"></button><button class="inspiration-card" aria-label="Inspiración vintage"></button></div></section><nav class="mobile-nav"><button>✦<br>Diseña</button><button>✚<br>Crea</button><button>▣<br>Diseños</button><button>AI<br>Herramientas</button></nav></main>
      <aside class="right-column"><section class="rightbar"><div class="section-heading"><h2>Mis Diseños Recientes</h2><button class="link">Ver todos →</button></div><div class="recent" id="recent-designs"><span class="trend">Cargando diseños...</span></div></section><section class="rightbar"><div class="section-heading"><h2>Tendencias Ahora</h2><button class="link">Ver todas →</button></div><div class="trend-list" id="trends"><span class="trend">Cargando...</span></div><div class="print-card"><h3>¡Lleva tus diseños<br>al siguiente nivel!</h3><p>Servicios de impresión y productos personalizados.</p><button>Ver Servicios →</button></div><div class="help-card"><span class="help-orb">◉</span><div><b>¿Necesitas ayuda?</b><span>Habla con nuestra IA</span></div><button class="chat">Chat IA</button></div></section></aside>
    </div><dialog id="studio"><form class="studio-form" id="design-form"><div class="section-heading"><div><div class="eyebrow">Nuevo proyecto</div><h2>Generador IA</h2></div><button class="secondary" type="button" data-close-studio>✕</button></div><label>Nombre del diseño<input name="title" maxlength="120" placeholder="Ej. Halcón urbano" required /></label><label>Estilo<input name="style" maxlength="60" placeholder="Ej. Streetwear" value="Urbano" /></label><label>Describe tu idea<textarea name="prompt" maxlength="1000" placeholder="Un póster de..." ></textarea></label><div class="status" id="form-status"></div><div class="form-actions"><button class="secondary" type="button" data-close-studio>Cancelar</button><button class="primary" type="submit">Guardar borrador →</button></div></form></dialog>
    <script>const recent=document.querySelector('#recent-designs'),trends=document.querySelector('#trends'),dialog=document.querySelector('#studio'),form=document.querySelector('#design-form'),status=document.querySelector('#form-status');const escape=v=>String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));const load=()=>fetch('/api/dashboard').then(r=>r.json()).then(data=>{recent.innerHTML=data.recentDesigns.map(d=>'<div class="recent-item"><span class="thumb"></span><div><b>'+escape(d.title)+'</b><span>'+escape(d.style)+'</span></div></div>').join('');trends.innerHTML=data.trends.map(t=>'<span class="trend">'+escape(t)+'</span>').join('')});document.querySelectorAll('[data-open-studio]').forEach(b=>b.addEventListener('click',()=>dialog.showModal()));document.querySelectorAll('[data-close-studio]').forEach(b=>b.addEventListener('click',()=>dialog.close()));form.addEventListener('submit',async e=>{e.preventDefault();status.textContent='Guardando...';const fields=new FormData(form),body=Object.fromEntries(fields);const r=await fetch('/api/designs',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});if(!r.ok){status.textContent='No se pudo guardar. Inténtalo de nuevo.';return}status.textContent='¡Borrador guardado!';form.reset();await load();setTimeout(()=>dialog.close(),550)});load().catch(()=>recent.textContent='No fue posible cargar los diseños.');</script>
    <script>
      (()=>{const $=s=>document.querySelector(s),j=(u,o={})=>fetch(u,o).then(r=>r.json().then(x=>({r,x})));let previews=[];
      const auth=document.createElement('dialog');auth.innerHTML='<form class="studio-form" id="auth-form"><h2>Tu espacio PINOLEROS</h2><label>Nombre completo <small>(requerido al crear cuenta)</small><input name="name" autocomplete="name" maxlength="80"></label><label>Nick name <small>(opcional)</small><input name="nickname" maxlength="50" placeholder="Tu nombre creativo"></label><label>Correo electrónico<input name="email" type="email" autocomplete="email" required></label><label>Contraseña<input name="password" type="password" autocomplete="current-password" minlength="10" required></label><label>Móvil <small>(requerido al crear cuenta)</small><input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="Ej. +505 8888 8888"></label><div class="status"></div><div class="form-actions"><button class="secondary" value="login">Iniciar sesión</button><button class="primary" value="register">Crear cuenta</button></div></form>';document.body.append(auth);
      const account=$('.avatar');account.addEventListener('click',()=>auth.showModal());auth.querySelector('form').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,action=e.submitter.value;if(action==='register'&&(!f.phone.value.trim()||!f.name.value.trim())){f.querySelector('.status').textContent='Agrega tu nombre y número móvil para crear la cuenta.';return}const {r,x}=await j('/api/auth/'+action,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(f)))});if(!r.ok){f.querySelector('.status').textContent=x.error;return}account.textContent=x.user.email.slice(0,2).toUpperCase();auth.close();location.assign('/crear')});
      const original=$('#design-form'),form=original.cloneNode(true);original.replaceWith(form);const results=document.createElement('div');results.className='results';form.append(results);form.insertAdjacentHTML('beforeend','<label><input name="isPublic" type="checkbox"> Publicar en la galería</label>');
      form.addEventListener('submit',async e=>{e.preventDefault();const body=Object.fromEntries(new FormData(form));const {r,x}=await j('/api/generate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});if(!r.ok){form.querySelector('.status').textContent=x.error; if(r.status===401)auth.showModal();return}previews=x.options;results.innerHTML=x.options.map((o,i)=>'<button class="result" data-i="'+i+'"><img src="'+o.image+'"><span>♥ Elegir propuesta '+(i+1)+'</span></button>').join('')});
      results.addEventListener('click',async e=>{const b=e.target.closest('[data-i]');if(!b)return;const data=Object.fromEntries(new FormData(form));data.image=previews[+b.dataset.i].image;data.isPublic=!!form.isPublic.checked;const {r,x}=await j('/api/creations',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(data)});form.querySelector('.status').textContent=r.ok?'♥ Guardada en tu nube PINOLEROS':x.error});
      const nav=[...document.querySelectorAll('.nav button')];const scrollTo=(selector)=>document.querySelector(selector)?.scrollIntoView({behavior:'smooth',block:'start'});nav[0].onclick=async()=>{const {x}=await j('/api/auth/me');if(x.user){location.assign('/crear');return}auth.showModal()};nav[1].onclick=()=>$('#studio').showModal();const personalSpace=async()=>{const {r,x}=await j('/api/creations');if(!r.ok){auth.showModal();return}const gallery=document.createElement('dialog');gallery.className='personal-space';gallery.innerHTML='<form method="dialog"><button class="secondary close-space">Cerrar</button></form><h2>Mi espacio creativo</h2><p>Selecciona uno de tus diseños para preparar su impresión.</p><div class="results">'+x.creations.map(c=>'<article class="result"><img src="'+c.imageUrl+'" alt="'+String(c.title).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'"><span>♥ '+c.title+(c.is_public?' · Público':' · Privado')+'</span><button class="print-design" data-design-id="'+c.id+'" data-design-title="'+String(c.title).replace(/"/g,'&quot;')+'">Imprimir este diseño</button></article>').join('')+'</div>';document.body.append(gallery);gallery.addEventListener('click',async event=>{const button=event.target.closest('.print-design');if(!button)return;const product=prompt('¿En qué producto deseas imprimir “'+button.dataset.designTitle+'”?\nEjemplo: Camiseta, gorra o taza','Camiseta');if(!product)return;const {r,x}=await j('/api/print-orders',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({designId:button.dataset.designId,product})});if(!r.ok){alert(x.error||'No fue posible crear la solicitud.');return}alert('Solicitud de impresión creada para '+x.product+'. Te contactaremos al móvil registrado.');});gallery.showModal()};nav[2].onclick=personalSpace;nav[3].onclick=()=>scrollTo('.styles');nav[4].onclick=()=>scrollTo('.tools');nav[5].onclick=()=>auth.showModal();document.querySelectorAll('[data-print]').forEach(button=>button.onclick=()=>location.assign('/mi-espacio'));if(location.pathname==='/mi-espacio')personalSpace();
      })();
    </script>
    <script>
      (()=>{const hero=document.querySelector('.hero');hero.innerHTML='<div class="hero-slides"><article class="hero-slide active" data-slide="0"><div class="slide-copy"><div class="slide-kicker">PINOLEROS.AI · THINKING & PRINTING</div><h1>Tu imaginación<b>no tiene límites</b></h1><p>Crea diseños únicos con nuestra IA y llévalos a la impresión.</p><div class="slide-actions"><button class="start" data-open-studio>Comenzar a Diseñar →</button><button class="print" data-print>Imprímelo →</button></div></div></article><article class="hero-slide" data-slide="1"><div class="slide-copy"><div class="slide-kicker">CREATIVIDAD SIN PAUSA</div><h1>Imagina.<b>Crea. Impacta.</b></h1><p>Transforma una idea en un diseño que se reconoce al instante.</p><div class="slide-actions"><button class="start" data-open-studio>Crear con IA →</button><button class="print" data-print>Imprímelo →</button></div></div></article><article class="hero-slide" data-slide="2"><div class="slide-copy"><div class="slide-kicker">DE TU IDEA A TU PRENDA</div><h1>Diseña hoy.<b>Vístelo mañana.</b></h1><p>Elige tu creación favorita y prepárala para camisetas, gorras y más.</p><div class="slide-actions"><button class="start" data-open-studio>Comenzar a Diseñar →</button><button class="print" data-print>Imprímelo →</button></div></div></article></div><div class="slide-dots"><button class="active" aria-label="Slide 1"></button><button aria-label="Slide 2"></button><button aria-label="Slide 3"></button></div>';const slides=[...hero.querySelectorAll('.hero-slide')],dots=[...hero.querySelectorAll('.slide-dots button')];let index=0;const show=n=>{index=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('active',i===index));dots.forEach((d,i)=>d.classList.toggle('active',i===index))};dots.forEach((d,i)=>d.onclick=()=>show(i));setInterval(()=>show(index+1),6500);hero.querySelectorAll('[data-open-studio]').forEach(b=>b.onclick=()=>document.querySelector('#studio').showModal());hero.querySelectorAll('[data-print]').forEach(b=>b.onclick=()=>document.querySelector('.side-cta').scrollIntoView({behavior:'smooth'}));})();
    </script>
    <script>
      (()=>{const copy='<div class="slide-kicker">PINOLEROS.AI · THINKING & PRINTING</div><h1>Tu imaginación<b>no tiene límites</b></h1><p>Crea diseños únicos con nuestra IA, personaliza, combina, vence tendencias y lleva tus ideas a la impresión.</p><div class="slide-actions"><button class="start" data-open-studio>Imagina y Crea</button><button class="print" data-print>Imprímelo</button></div>';document.querySelectorAll('.hero-slide .slide-copy').forEach(node=>node.innerHTML=copy);document.querySelectorAll('.hero-slide [data-open-studio]').forEach(button=>button.onclick=()=>document.querySelector('#studio').showModal());document.querySelectorAll('.hero-slide [data-print]').forEach(button=>button.onclick=()=>location.assign('/mi-espacio'));})();
    </script>
  </body>
</html>`;
}
