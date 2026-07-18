/* =========================================================
   Perfil do Aluno — clássico e editorial (fundo claro)
   ========================================================= */

const TIPO_CLASSE = { "1":"ouro","2":"prata","3":"bronze",mh:"mh" };
const TIPO_LABEL  = { "1":"Ouro", "2":"Prata", "3":"Bronze",mh:"MH" };

function escurecer(hex,f=0.4){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgb(${Math.floor(r*f)},${Math.floor(g*f)},${Math.floor(b*f)})`;
}

function animarNumero(el,valor,dur=900){
  const t0=performance.now();
  const tick=now=>{
    const p=Math.min((now-t0)/dur,1);
    el.textContent=Math.floor((1-Math.pow(1-p,3))*valor);
    if(p<1)requestAnimationFrame(tick);else el.textContent=valor;
  };
  requestAnimationFrame(tick);
}

function iniciarParticulas(cor){
  const canvas=document.getElementById("canvas-particulas");
  const ctx=canvas.getContext("2d");
  canvas.width=window.innerWidth; canvas.height=window.innerHeight;
  canvas.classList.add("ativo");
  const r=parseInt(cor.slice(1,3),16),g=parseInt(cor.slice(3,5),16),b=parseInt(cor.slice(5,7),16);
  const pts=Array.from({length:60},()=>({
    x:Math.random()*canvas.width,y:Math.random()*canvas.height,
    r:Math.random()*2+0.5,vx:(Math.random()-.5)*.3,
    vy:-(Math.random()*.6+.2),a:Math.random()*.4+.1,
  }));
  const loop=()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    pts.forEach(p=>{
      p.x+=p.vx;p.y+=p.vy;p.a-=.001;
      if(p.y<-5||p.a<=0){p.x=Math.random()*canvas.width;p.y=canvas.height+5;p.a=Math.random()*.4+.1;}
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(${r},${g},${b},${p.a})`;ctx.fill();
    });
    requestAnimationFrame(loop);
  };
  loop();
  window.addEventListener("resize",()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;});
}

const IC_CURSO  =`<path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>`;
const IC_TURMA  =`<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>`;
const IC_DATA   =`<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>`;
const IC_REL    =`<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`;

function svg(d){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;}

function metaItem(cls,icone,txt){
  return `<span class="${cls}__meta-item">${svg(icone)}${txt}</span>`;
}

function buildMeta(cls,aluno,p1,p2){
  return [
    metaItem(cls,IC_CURSO,aluno.turma.curso.nome),
    metaItem(cls,IC_TURMA,aluno.turma.nome),
    aluno.ano_ingresso?metaItem(cls,IC_DATA,`Ingressou em ${aluno.ano_ingresso}`):null,
    p1?metaItem(cls,IC_REL,p1===p2?`Medalhas em ${p1}`:`${p1} – ${p2}`):null,
  ].filter(Boolean).join("");
}

// ---- CLÁSSICO ----
function renderClassico(aluno,resultados,totais,total,anos,eDestaque){
  const p1=anos.length?Math.min(...anos):null, p2=anos.length?Math.max(...anos):null;
  const ordenados=[...resultados].sort((a,b)=>b.edicao.ano-a.edicao.ano);
  return `
  <div class="classico">
    <div class="classico__hero">
      <div class="classico__foto-wrap">
        <img class="classico__foto" src="${aluno.foto_url||'https://i.pravatar.cc/200?img=1'}" alt="${aluno.nome}"/>
        ${eDestaque?`<div class="classico__badge-especial">✦</div>`:""}
      </div>
      <div class="classico__info">
        ${eDestaque?`<div class="editorial__badge editorial__badge--especial" style="position:static;transform:none;margin-bottom:16px;display:inline-flex;">✦ Destaque especial</div>`:""}
        <span class="classico__eyebrow">Medalhista · IFPI Campus Pedro II</span>
        <h1 class="classico__nome">${aluno.nome}</h1>
        <div class="classico__meta">${buildMeta("classico",aluno,p1,p2)}</div>
        ${aluno.frase?`<p class="classico__frase">"${aluno.frase}"</p>`:""}
      </div>
    </div>

    <div class="classico__stats">
      ${[{cls:"total",v:total,l:"Total"},{cls:"ouro",v:totais["1"],l:"Ouro"},{cls:"prata",v:totais["2"],l:"Prata"},{cls:"bronze",v:totais["3"],l:"Bronze"},{cls:"mh",v:totais.mh,l:"Menção"}]
        .map(i=>`<div class="classico__stat classico__stat--${i.cls}"><span class="classico__stat-valor" data-valor="${i.v}">0</span><span class="classico__stat-label">${i.l}</span></div>`).join("")}
    </div>

    ${aluno.biografia?`<p class="classico__secao-titulo">História</p><div class="classico__bio">${aluno.biografia}</div>`:""}

    <p class="classico__secao-titulo" style="margin-bottom:20px;">Conquistas</p>
    <div class="classico__medalhas">
      ${ordenados.length?ordenados.map(r=>{
        const c=TIPO_CLASSE[r.posicao];
        return `<div class="classico__medalha classico__medalha--${c}">
          <div class="classico__medalha-icone">${TIPO_LABEL[r.posicao]}</div>
          <div class="classico__medalha-info"><strong>${r.modalidade.nome}</strong><span>${r.edicao.nome}</span></div>
          <span class="classico__medalha-ano">${r.edicao.ano}</span>
        </div>`;
      }).join(""):`<p style="color:#aaa;">Nenhuma medalha registrada ainda.</p>`}
    </div>
  </div>`;
}

// ---- EDITORIAL ----
function renderEditorial(aluno,resultados,totais,total,anos,eDestaque){
  const p1=anos.length?Math.min(...anos):null, p2=anos.length?Math.max(...anos):null;
  const ordenados=[...resultados].sort((a,b)=>b.edicao.ano-a.edicao.ano);

  const statsCards=[
    {cls:"total",v:total,l:"Total"},{cls:"ouro",v:totais["1"],l:"Ouro"},
    {cls:"prata",v:totais["2"],l:"Prata"},{cls:"bronze",v:totais["3"],l:"Bronze"},
    {cls:"mh",v:totais.mh,l:"Menção"},
  ].map(i=>`<div class="editorial__stat-card editorial__stat--${i.cls}">
    <span class="editorial__stat-valor" data-valor="${i.v}">0</span>
    <span class="editorial__stat-label">${i.l}</span>
  </div>`).join("");

  const heroStats=[
    {v:total,l:"Medalhas"},{v:totais["1"],l:"Ouros"},{v:totais["2"],l:"Pratas"},
  ].map(i=>`<div class="editorial__hero-stat">
    <span class="editorial__hero-stat-valor" data-valor="${i.v}">0</span>
    <span class="editorial__hero-stat-label">${i.l}</span>
  </div>`).join("");

  const medalhasHtml=ordenados.length?ordenados.map(r=>{
    const c=TIPO_CLASSE[r.posicao];
    return `<div class="editorial__medalha editorial__medalha--${c}">
      <span class="editorial__medalha-tipo">${TIPO_LABEL[r.posicao]}</span>
      <span class="editorial__medalha-nome">${r.modalidade.nome}</span>
      <span class="editorial__medalha-edicao">${r.edicao.nome}</span>
      <span class="editorial__medalha-ano">${r.edicao.ano}</span>
    </div>`;
  }).join(""):`<p style="color:#aaa;font-size:.88rem;">Nenhuma medalha registrada ainda.</p>`;

  return `
  <div class="editorial">
    <div class="editorial__hero">
      <img class="editorial__foto" src="${aluno.foto_url||'https://i.pravatar.cc/800?img=1'}" alt="${aluno.nome}"/>
      <div class="editorial__hero-gradiente"></div>
      <div class="editorial__hero-acento"></div>
      <span class="editorial__hero-num">${total}</span>
      ${eDestaque?`<div class="editorial__badge editorial__badge--especial">✦ Destaque especial · IFPI Pedro II</div>`:`<div class="editorial__badge">Medalhista · IFPI Campus Pedro II</div>`}
      <div class="editorial__hero-bottom">
        <div>
          <span class="editorial__eyebrow">Medalhista · IFPI Campus Pedro II</span>
          <h1 class="editorial__nome">${aluno.nome}</h1>
        </div>
        <div class="editorial__hero-stats">${heroStats}</div>
      </div>
    </div>

    <div class="editorial__separador"></div>

    <div class="editorial__corpo">
      <div class="editorial__container">
        <aside class="editorial__sidebar">
          <div class="editorial__info-bloco">
            <p class="editorial__info-titulo">Informações</p>
            ${buildMeta("editorial",aluno,p1,p2)}
          </div>
          ${aluno.frase?`<div class="editorial__info-bloco"><p class="editorial__info-titulo">Frase</p><p class="editorial__frase">"${aluno.frase}"</p></div>`:""}
          <div class="editorial__info-bloco">
            <p class="editorial__info-titulo">Medalhas</p>
            <div class="editorial__stats-grid">${statsCards}</div>
          </div>
        </aside>

        <main class="editorial__main">
          ${aluno.biografia?`<div><p class="editorial__secao-titulo">História</p><p class="editorial__bio">${aluno.biografia}</p></div>`:""}
          <div>
            <p class="editorial__secao-titulo">Conquistas</p>
            <div class="editorial__medalhas">${medalhasHtml}</div>
          </div>
        </main>
      </div>
    </div>
  </div>`;
}

// ---- MAIN ----
async function carregarPerfil(){
  const params=new URLSearchParams(window.location.search);
  const alunoId=params.get("id");
  const loading=document.getElementById("perfil-loading");
  const root=document.getElementById("perfil-root");

  if(!alunoId){loading.textContent="Nenhum aluno especificado.";return;}

  try{
    const [alunoRes,resultadosRes]=await Promise.all([
      fetch(`${API_BASE_URL}/api/alunos/${alunoId}`),
      fetch(`${API_BASE_URL}/api/resultados?aluno_id=${alunoId}`),
    ]);
    if(!alunoRes.ok) throw new Error("Aluno não encontrado.");

    const aluno=await alunoRes.json();
    const resultados=await resultadosRes.json();

    const corTema=aluno.cor_tema||"#1B7A3E";
    const eDestaque=aluno.destaque_especial===1;
    const layout=aluno.layout_perfil||"classico";

    document.documentElement.style.setProperty("--cor-tema",corTema);
    document.documentElement.style.setProperty("--cor-tema-escura",escurecer(corTema));
    document.title=`${aluno.nome} — Portal OlimpIF`;

    const totais={"1":0,"2":0,"3":0,mh:0};
    resultados.forEach(r=>totais[r.posicao]++);
    const total=resultados.length;
    const anos=resultados.map(r=>r.edicao.ano);

    const html=layout==="editorial"
      ?renderEditorial(aluno,resultados,totais,total,anos,eDestaque)
      :renderClassico(aluno,resultados,totais,total,anos,eDestaque);

    root.innerHTML=`
      <a class="perfil-voltar" href="javascript:history.back()">
        ${svg(`<path d="M19 12H5M12 5l-7 7 7 7"/>`)}
        Voltar
      </a>
      ${html}
      <footer class="perfil-footer-bar">
        <span class="perfil-footer-bar__marca">Portal OlimpIF · IFPI Campus Pedro II</span>
        <span class="perfil-footer-bar__link">${window.location.origin}/aluno.html?id=${aluno.id}</span>
      </footer>`;

    loading.style.display="none";
    root.style.display="block";

    setTimeout(()=>{
      root.querySelectorAll("[data-valor]").forEach(el=>animarNumero(el,Number(el.dataset.valor)));
    },300);

    if(eDestaque) iniciarParticulas(corTema);

  }catch(err){
    console.error(err);
    loading.textContent="Não foi possível carregar o perfil. Verifique se a API está rodando.";
  }
}

document.addEventListener("DOMContentLoaded",carregarPerfil);
