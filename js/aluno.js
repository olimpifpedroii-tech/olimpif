/* Perfil do Aluno — layout único premium */

const MEDALHA_ICONE = {
  "1": `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="6"/><path d="M9 11 6 3h2l4 5 4-5h2l-3 8"/><path d="M12 18v-6"/><path d="M9 15h6"/></svg>`,
  "2": `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="6"/><path d="M9 11 6 3h2l4 5 4-5h2l-3 8"/><path d="M9.5 13.5c0-1 3-2.5 3-4a1.5 1.5 0 0 0-3 0"/><path d="M9 17h6"/></svg>`,
  "3": `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="6"/><path d="M9 11 6 3h2l4 5 4-5h2l-3 8"/><path d="M9.5 13.5a1.5 1.5 0 0 1 3 0c0 .8-1 1.5-1 1.5s1 .7 1 1.5a1.5 1.5 0 0 1-3 0"/></svg>`,
  "mh": `<svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
};

const TIPO_CLASSE = { "1":"ouro","2":"prata","3":"bronze",mh:"mh" };
const TIPO_LABEL  = { "1":"Ouro","2":"Prata","3":"Bronze",mh:"Menção Honrosa" };
  if (!url) return 'https://i.pravatar.cc/400?img=1';
  return url.startsWith('http') ? url : API_BASE_URL + url;
}

function escurecer(hex, f=0.4) {
  const r=parseInt(hex.slice(1,3),16), g=parseInt(hex.slice(3,5),16), b=parseInt(hex.slice(5,7),16);
  return `rgb(${Math.floor(r*f)},${Math.floor(g*f)},${Math.floor(b*f)})`;
}

function animarNumero(el, valor, dur=900) {
  const t0=performance.now();
  const tick=now=>{
    const p=Math.min((now-t0)/dur,1);
    el.textContent=Math.floor((1-Math.pow(1-p,3))*valor);
    if(p<1)requestAnimationFrame(tick); else el.textContent=valor;
  };
  requestAnimationFrame(tick);
}

function iniciarParticulas(cor) {
  const canvas=document.getElementById("canvas-particulas");
  const ctx=canvas.getContext("2d");
  canvas.width=window.innerWidth; canvas.height=window.innerHeight;
  canvas.classList.add("ativo");
  const r=parseInt(cor.slice(1,3),16), g=parseInt(cor.slice(3,5),16), b=parseInt(cor.slice(5,7),16);
  const pts=Array.from({length:50},()=>({
    x:Math.random()*canvas.width, y:Math.random()*canvas.height,
    r:Math.random()*2+0.5, vx:(Math.random()-.5)*.3,
    vy:-(Math.random()*.5+.2), a:Math.random()*.4+.1,
  }));
  const loop=()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pts.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy; p.a-=.001;
      if(p.y<-5||p.a<=0){p.x=Math.random()*canvas.width; p.y=canvas.height+5; p.a=Math.random()*.4+.1;}
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${r},${g},${b},${p.a})`; ctx.fill();
    });
    requestAnimationFrame(loop);
  };
  loop();
}

const IC = {
  curso:   `<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>`,
  turma:   `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>`,
  data:    `<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>`,
  relogio: `<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`,
};

function svg(d){ return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`; }

async function carregarPerfil() {
  const alunoId = new URLSearchParams(window.location.search).get("id");
  const loading = document.getElementById("perfil-loading");
  const root    = document.getElementById("perfil-root");

  if (!alunoId) { loading.textContent = "Nenhum aluno especificado."; return; }

  try {
    const [alunoRes, resultadosRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/alunos/${alunoId}`),
      fetch(`${API_BASE_URL}/api/resultados?aluno_id=${alunoId}`),
    ]);
    if (!alunoRes.ok) throw new Error();

    const aluno      = await alunoRes.json();
    const resultados = await resultadosRes.json();

    const corTema   = aluno.cor_tema || "#1B7A3E";
    const eDestaque = aluno.destaque_especial === 1;

    document.documentElement.style.setProperty("--cor-tema", corTema);
    document.title = `${aluno.nome} — Portal OlimpIF`;

    const totais = {"1":0,"2":0,"3":0,mh:0};
    resultados.forEach(r => totais[r.posicao]++);
    const total = resultados.length;
    const anos  = resultados.map(r => r.edicao.ano);
    const p1    = anos.length ? Math.min(...anos) : null;
    const p2    = anos.length ? Math.max(...anos) : null;

    // Divide o nome em primeiro e restante para destacar
    const partes    = aluno.nome.trim().split(" ");
    const primeiro  = partes[0];
    const restante  = partes.slice(1).join(" ");

    const metaHtml = [
      `<span class="perfil-hero__meta-item">${svg(IC.curso)}${aluno.turma.curso.nome}</span>`,
      `<span class="perfil-hero__meta-item">${svg(IC.turma)}${aluno.turma.nome}</span>`,
      aluno.ano_ingresso ? `<span class="perfil-hero__meta-item">${svg(IC.data)}Ingressou em ${aluno.ano_ingresso}</span>` : "",
      p1 ? `<span class="perfil-hero__meta-item">${svg(IC.relogio)}${p1 === p2 ? `Medalhas em ${p1}` : `${p1} – ${p2}`}</span>` : "",
    ].filter(Boolean).join("");

    const statsHtml = [
      {cls:"total",v:total,l:"Total"},
      {cls:"ouro",v:totais["1"],l:"Ouro"},
      {cls:"prata",v:totais["2"],l:"Prata"},
      {cls:"bronze",v:totais["3"],l:"Bronze"},
      {cls:"mh",v:totais.mh,l:"Menção"},
    ].map(s => `
      <div class="perfil-stat perfil-stat--${s.cls}">
        <span class="perfil-stat__valor" data-valor="${s.v}">0</span>
        <span class="perfil-stat__label">${s.l}</span>
      </div>`).join("");

    const ordenados = [...resultados].sort((a,b) => b.edicao.ano - a.edicao.ano);
    const medalhasHtml = ordenados.length
      ? ordenados.map(r => {
          const c = TIPO_CLASSE[r.posicao];
          return `
            <div class="perfil-medalha perfil-medalha--${c}">
              <div class="perfil-medalha__simbolo">${MEDALHA_ICONE[r.posicao]}</div>
              <span class="perfil-medalha__tipo">${TIPO_LABEL[r.posicao]}</span>
              <div class="perfil-medalha__nome">${r.modalidade.nome}</div>
              <div class="perfil-medalha__edicao">${r.edicao.nome}</div>
              <span class="perfil-medalha__ano">${r.edicao.ano}</span>
            </div>`;
        }).join("")
      : `<p style="color:#bbb;font-size:.88rem;">Nenhuma medalha registrada ainda.</p>`;

    root.innerHTML = `
      <a class="perfil-voltar" href="javascript:history.back()">
        ${svg(`<path d="M19 12H5M12 5l-7 7 7 7"/>`)}
        Voltar
      </a>

      <div class="perfil-wrapper">
        <div class="perfil-hero">
          <div class="perfil-hero__foto-wrap">
            <img class="perfil-hero__foto" src="${fotoSrc(aluno.foto_url)}" alt="${aluno.nome}" />
            <div class="perfil-hero__foto-acento"></div>
          </div>
          <div class="perfil-hero__info">
            ${eDestaque ? `<span class="perfil-hero__eyebrow">✦ Destaque especial · IFPI Pedro II</span>` : `<span class="perfil-hero__eyebrow">Medalhista · IFPI Campus Pedro II</span>`}
            <h1 class="perfil-hero__nome">${primeiro}<br><span>${restante}</span></h1>
            <div class="perfil-hero__meta">${metaHtml}</div>
            ${aluno.frase ? `<p class="perfil-hero__frase">"${aluno.frase}"</p>` : ""}
          </div>
        </div>

        <div class="perfil-stats">${statsHtml}</div>

        ${aluno.biografia ? `
          <p class="perfil-secao-titulo">História</p>
          <div class="perfil-bio">${aluno.biografia}</div>` : ""}

        <p class="perfil-secao-titulo">Conquistas</p>
        <div class="perfil-medalhas">${medalhasHtml}</div>
      </div>

      <footer class="perfil-footer-bar">
        <span class="perfil-footer-bar__marca">Portal OlimpIF · IFPI Campus Pedro II</span>
      </footer>`;

    loading.style.display = "none";
    root.style.display    = "flex";

    setTimeout(() => {
      root.querySelectorAll("[data-valor]").forEach(el => animarNumero(el, Number(el.dataset.valor)));
    }, 300);

    if (eDestaque) iniciarParticulas(corTema);

  } catch(err) {
    loading.textContent = "Não foi possível carregar o perfil. Verifique se a API está rodando.";
  }
}

document.addEventListener("DOMContentLoaded", carregarPerfil);
