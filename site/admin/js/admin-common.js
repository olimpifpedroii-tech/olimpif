/* =========================================================
   Painel Admin — Scripts compartilhados
   Reaproveita ICONES e preencherFiltro de ../js/common.js
   ========================================================= */

const NAV_ITENS_ADMIN = [
  { href: "dashboard.html", label: "Início", icone: "home" },
  { href: "alunos.html", label: "Alunos", icone: "aluno" },
  { href: "modalidades.html", label: "Modalidades", icone: "modalidade" },
  { href: "resultados.html", label: "Resultados", icone: "medalha" },
  { href: "destaques.html", label: "Destaques", icone: "destaque" },
  { href: "edicoes.html", label: "Edições", icone: "edicao" },
  { href: "hall-da-fama.html", label: "Hall da Fama", icone: "hall" },
  { href: "galeria.html", label: "Galeria", icone: "galeria" },
  { href: "noticias.html", label: "Notícias", icone: "noticias" },
];

// Ícones extras (além dos já definidos em ICONES, de ../js/common.js)
Object.assign(ICONES, {
  aluno: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>`,
  sair: `<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>`,
  externo: `<svg viewBox="0 0 24 24"><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6"/></svg>`,
  mais: `<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>`,
  editar: `<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`,
  excluir: `<svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>`,
  fechar: `<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
  caixa: `<svg viewBox="0 0 24 24"><path d="M21 8 12 3 3 8l9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></svg>`,
  check: `<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>`,
  hall: `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  galeria: `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`,
  noticias: `<svg viewBox="0 0 24 24"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>`,
});

/**
 * Monta o aside do painel admin dentro de #aside-container.
 * paginaAtual: nome do arquivo atual (ex: "dashboard.html")
 */
function montarAsideAdmin(paginaAtual) {
  const container = document.getElementById("aside-container");
  if (!container) return;

  const links = NAV_ITENS_ADMIN.map((item) => {
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
        <div class="aside__brand-mark aside__brand-mark--admin">IF</div>
        <div class="aside__brand-text">
          <strong>Painel Admin</strong>
          <span>Olimpíadas IFPI</span>
        </div>
      </div>
      <nav class="aside__nav">
        ${links}
      </nav>
      <div class="aside__footer" style="display:flex; flex-direction:column; gap:4px;">
        <a class="aside__link" href="../index.html" target="_blank">
          ${ICONES.externo}
          <span>Ver site</span>
        </a>
        <a class="aside__link aside__link--sair" href="login.html" id="link-sair">
          ${ICONES.sair}
          <span>Sair</span>
        </a>
      </div>
    </aside>`;

  montarTopbar();
}

/**
 * Abre um modal pelo id.
 */
function abrirModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.removeAttribute("hidden");
}

/**
 * Fecha um modal pelo id.
 */
function fecharModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.setAttribute("hidden", "");
}

/**
 * Configura fechamento de modal por: botão "x", botão "cancelar"
 * e clique fora do conteúdo do modal.
 */
function configurarFechamentoModal(idModal) {
  const modal = document.getElementById(idModal);
  if (!modal) return;

  modal.querySelectorAll("[data-fechar-modal]").forEach((el) => {
    el.addEventListener("click", () => fecharModal(idModal));
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) fecharModal(idModal);
  });
}

/**
 * Exibe um toast de confirmação no canto inferior direito.
 */
function mostrarToast(mensagem) {
  let toast = document.getElementById("toast-admin");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-admin";
    toast.className = "toast";
    toast.innerHTML = `${ICONES.check}<span></span>`;
    document.body.appendChild(toast);
  }

  toast.querySelector("span").textContent = mensagem;
  toast.classList.add("is-visivel");

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove("is-visivel");
  }, 2600);
}

/**
 * Pré-visualização de foto: ao escolher um arquivo no input,
 * mostra a imagem no elemento de preview indicado.
 * No backend, o arquivo deve ser enviado via FormData para o endpoint
 * de upload (ex: POST /api/alunos/{id}/foto).
 */
function configurarPreviewFoto(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  if (!input || !preview) return;

  input.addEventListener("change", () => {
    const arquivo = input.files[0];
    if (!arquivo) return;
    const leitor = new FileReader();
    leitor.onload = (e) => {
      preview.src = e.target.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const pagina = document.body.dataset.pagina || "dashboard.html";

  // Protege as páginas do admin: sem token, volta para o login
  const token = localStorage.getItem("token_admin");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  montarAsideAdmin(pagina);

  // Configura o botão "Sair" para limpar o token
  const linkSair = document.getElementById("link-sair");
  if (linkSair) {
    linkSair.addEventListener("click", () => {
      localStorage.removeItem("token_admin");
    });
  }

  // Fecha modais com a tecla Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-fundo:not([hidden])").forEach((modal) => {
        modal.setAttribute("hidden", "");
      });
    }
  });
});

/**
 * Faz uma requisição autenticada à API (envia o token salvo no login).
 * Se a API responder 401 (token inválido/expirado), redireciona para o login.
 */
async function fetchAutenticado(url, opcoes = {}) {
  const token = localStorage.getItem("token_admin");

  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      ...(opcoes.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (resposta.status === 401) {
    localStorage.removeItem("token_admin");
    window.location.href = "login.html";
    throw new Error("Sessão expirada. Faça login novamente.");
  }

  return resposta;
}
