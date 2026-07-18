/* =========================================================
   Olimpíadas IFPI — Scripts compartilhados
   ========================================================= */

// Ícones SVG (sem emojis) usados na navegação
const ICONES = {
  home: `<svg viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/></svg>`,
  medalha: `<svg viewBox="0 0 24 24"><circle cx="12" cy="15" r="5"/><path d="M9 11 6 3h2l4 6 4-6h2l-3 8"/></svg>`,
  destaque: `<svg viewBox="0 0 24 24"><path d="M12 2 14.5 8.5 21 9l-5 4.5L17.5 21 12 17l-5.5 4 1.5-7.5L3 9l6.5-.5z"/></svg>`,
  modalidade: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
  edicao: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>`,
  ranking: `<svg viewBox="0 0 24 24"><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M5 6H3v2a3 3 0 0 0 3 3"/><path d="M19 6h2v2a3 3 0 0 1-3 3"/></svg>`,
  historico: `<svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-4"/></svg>`,
  sobre: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>`,
  busca: `<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
  hall: `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  galeria: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
  noticias: `<svg viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>`,
  mapa: `<svg viewBox="0 0 24 24"><path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7z"/><path d="M9 4v13M15 7v13"/></svg>`,
  admin: `<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.5 8.5 8 11 4.5-2.5 8-6 8-11V5z"/><path d="M9 12l2 2 4-4"/></svg>`,
  menu: `<svg viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18"/></svg>`,
  fechar: `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
};

// Itens de navegação principal
const NAV_ITENS = [
  { href: "index.html", label: "Início", icone: "home" },
  { href: "busca.html", label: "Buscar aluno", icone: "busca" },
  { href: "medalhistas.html", label: "Medalhistas", icone: "medalha" },
  { href: "ranking.html", label: "Ranking", icone: "ranking" },
  { href: "hall-da-fama.html", label: "Hall da Fama", icone: "hall" },
  { href: "destaques.html", label: "Destaques", icone: "destaque" },
  { href: "modalidades.html", label: "Modalidades", icone: "modalidade" },
  { href: "edicoes.html", label: "Edições", icone: "edicao" },
  { href: "galeria.html", label: "Galeria", icone: "galeria" },
  { href: "noticias.html", label: "Notícias", icone: "noticias" },
  { href: "historico.html", label: "Histórico", icone: "historico" },
  { href: "sobre.html", label: "Sobre", icone: "sobre" },
];

/**
 * Monta o aside de navegação dentro do elemento #aside-container.
 * paginaAtual: nome do arquivo atual (ex: "index.html")
 */
function montarAside(paginaAtual) {
  const container = document.getElementById("aside-container");
  if (!container) return;

  const links = NAV_ITENS.map((item) => {
    const ativo = item.href === paginaAtual ? " is-active" : "";
    return `
      <a class="aside__link${ativo}" href="${item.href}">
        ${ICONES[item.icone]}
        <span>${item.label}</span>
      </a>`;
  }).join("");

  container.innerHTML = `
    <aside class="aside" id="aside">
      <div class="aside__brand">
        <div class="aside__brand-mark">IF</div>
        <div class="aside__brand-text">
          <strong>Olimpíadas</strong>
          <span>IFPI</span>
        </div>
      </div>
      <nav class="aside__nav">
        ${links}
      </nav>
      <div class="aside__footer">
        <a class="aside__link aside__link--admin" href="admin/login.html">
          ${ICONES.admin}
          <span>Painel Admin</span>
        </a>
      </div>
    </aside>`;

  montarTopbar();
}

/**
 * Monta a barra superior (visível só em telas pequenas) com botão de menu.
 */
function montarTopbar() {
  const container = document.getElementById("topbar-container");
  if (!container) return;

  container.innerHTML = `
    <div class="topbar">
      <span class="topbar__brand">Olimpíadas IFPI</span>
      <button class="topbar__toggle" id="toggle-menu" aria-label="Abrir menu">
        ${ICONES.menu}
      </button>
    </div>`;

  const botao = document.getElementById("toggle-menu");
  const aside = document.getElementById("aside");

  botao.addEventListener("click", () => {
    const aberto = aside.classList.toggle("is-open");
    botao.innerHTML = aberto ? ICONES.fechar : ICONES.menu;
    botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  });
}

/**
 * Preenche um <select> com opções, incluindo "Todos/Todas" no topo.
 * select: elemento select
 * opcoes: array de { value, label }
 * textoTodos: texto da opção "todos" (ex: "Todas as edições")
 */
function preencherFiltro(select, opcoes, textoTodos) {
  const todasOpcoes = [{ value: "todos", label: textoTodos }, ...opcoes];
  select.innerHTML = todasOpcoes
    .map((o) => `<option value="${o.value}">${o.label}</option>`)
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.body.dataset.pagina || "index.html";
  montarAside(pagina);
});

/**
 * Gera um ícone de link para o perfil do aluno.
 * Uso: ${linkPerfil(aluno_id)}
 */
function linkPerfil(alunoId) {
  return `<a href="aluno.html?id=${alunoId}" title="Ver perfil" onclick="event.stopPropagation()" style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:50%;background:var(--verde-claro);text-decoration:none;flex-shrink:0;margin-left:6px;"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--verde-escuro)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg></a>`;
}
