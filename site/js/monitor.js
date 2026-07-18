/* Monitor */
function verificarLogin() {
  const t = localStorage.getItem("token_monitor");
  if (!t) { window.location.href = "login.html"; return null; }
  return t;
}

async function carregarAlunos(nome = "") {
  const corpo = document.getElementById("tabela-mon-alunos");
  try {
    const url = nome ? `${API_BASE_URL}/api/alunos?nome=${encodeURIComponent(nome)}` : `${API_BASE_URL}/api/alunos`;
    const alunos = await fetch(url).then(r => r.json());
    if (!alunos.length) { corpo.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--texto-suave);padding:24px;">Nenhum aluno encontrado.</td></tr>`; return; }
    corpo.innerHTML = alunos.map(a => `<tr><td><img class="monitor-tabela__foto" src="${a.foto_url || 'https://i.pravatar.cc/60?img=1'}" alt=""/>${a.nome}</td><td>${a.turma.nome}</td><td>${a.turma.curso.nome}</td><td>${a.turma.ano_serie}º</td></tr>`).join("");
  } catch { corpo.innerHTML = `<tr><td colspan="4" style="color:var(--vermelho);padding:16px;">Erro ao carregar.</td></tr>`; }
}

async function carregarResultados() {
  const corpo = document.getElementById("tabela-mon-resultados");
  try {
    const lista = await fetch(`${API_BASE_URL}/api/resultados`).then(r => r.json());
    corpo.innerHTML = lista.map(r => `<tr><td><span class="tag-medalha ${r.posicao === 'mh' ? 'tag-medalha--mh' : `tag-medalha--${r.posicao}`}">${r.posicao === 'mh' ? 'MH' : r.posicao + 'º'}</span></td><td>${r.aluno.nome}</td><td>${r.modalidade.nome}</td><td>${r.edicao.nome}</td></tr>`).join("");
  } catch { corpo.innerHTML = `<tr><td colspan="4" style="color:var(--vermelho);padding:16px;">Erro.</td></tr>`; }
}

async function carregarRanking() {
  const corpo = document.getElementById("tabela-mon-ranking");
  try {
    const lista = await fetch(`${API_BASE_URL}/api/ranking`).then(r => r.json());
    corpo.innerHTML = lista.map((item, i) => `<tr><td style="font-family:var(--fonte-display);font-weight:800;">${i + 1}º</td><td><img class="monitor-tabela__foto" src="${item.foto_url || 'https://i.pravatar.cc/60?img=1'}" alt=""/>${item.nome}</td><td style="font-family:var(--fonte-display);font-weight:800;">${item.total}</td><td style="color:#D4A017;font-weight:700;">${item.totais.ouro}</td><td style="color:#9AA5B1;font-weight:700;">${item.totais.prata}</td><td style="color:#b87333;font-weight:700;">${item.totais.bronze}</td><td style="color:#4a8a62;font-weight:700;">${item.totais.mh}</td></tr>`).join("");
  } catch { corpo.innerHTML = `<tr><td colspan="7" style="color:var(--vermelho);padding:16px;">Erro.</td></tr>`; }
}

async function carregarEdicoes() {
  const corpo = document.getElementById("tabela-mon-edicoes");
  try {
    const lista = await fetch(`${API_BASE_URL}/api/edicoes`).then(r => r.json());
    corpo.innerHTML = lista.map(e => `<tr><td>${e.nome}</td><td>${e.ano}</td><td>${e.data}</td></tr>`).join("");
  } catch { corpo.innerHTML = `<tr><td colspan="3" style="color:var(--vermelho);padding:16px;">Erro.</td></tr>`; }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!verificarLogin()) return;
  const links = document.querySelectorAll(".monitor-nav-link[data-secao]");
  const secoes = document.querySelectorAll(".monitor-secao");
  links.forEach(link => {
    link.addEventListener("click", () => {
      links.forEach(l => l.classList.remove("ativo"));
      secoes.forEach(s => s.classList.remove("ativo"));
      link.classList.add("ativo");
      document.getElementById(`secao-${link.dataset.secao}`).classList.add("ativo");
      if (link.dataset.secao === "resultados") carregarResultados();
      if (link.dataset.secao === "ranking") carregarRanking();
      if (link.dataset.secao === "edicoes") carregarEdicoes();
    });
  });
  document.getElementById("btn-sair").addEventListener("click", () => { localStorage.removeItem("token_monitor"); window.location.href = "login.html"; });
  let t;
  document.getElementById("busca-mon-aluno").addEventListener("input", e => { clearTimeout(t); t = setTimeout(() => carregarAlunos(e.target.value.trim()), 300); });
  carregarAlunos();
});
