/* =========================================================
   Modalidades — lista geral e histórico de campeões
   (dados reais da API)
   ========================================================= */

let modalidadeAtualId = null;
let EDICOES_MODALIDADE = [];
let LISTA_MODALIDADES_CACHE = [];

async function renderListaModalidades() {
  const container = document.getElementById("lista-modalidades");

  try {
    const res = await fetch(`${API_BASE_URL}/api/modalidades`);
    const modalidades = await res.json();
    LISTA_MODALIDADES_CACHE = modalidades;

    if (modalidades.length === 0) {
      container.innerHTML = `<p style="color: var(--texto-suave);">Nenhuma modalidade cadastrada ainda.</p>`;
      return;
    }

    container.innerHTML = modalidades
      .map(
        (m) => `
      <a class="card-item" href="#" data-modalidade="${m.id}">
        <div class="card-item__icon">
          <svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
        </div>
        <h3>${m.nome}</h3>
        <p>${m.descricao || "Sem descrição cadastrada."}</p>
        <span class="card-item__meta">Ver histórico →</span>
      </a>`
      )
      .join("");

    container.querySelectorAll("[data-modalidade]").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        abrirHistorico(Number(card.dataset.modalidade), card.querySelector("h3").textContent);
      });
    });
  } catch (erro) {
    console.error("Erro ao carregar modalidades:", erro);
    container.innerHTML = `<p style="color: var(--vermelho);">Não foi possível carregar as modalidades. Verifique se a API está rodando.</p>`;
  }
}

async function abrirHistorico(modalidadeId, nomeModalidade) {
  modalidadeAtualId = modalidadeId;
  const modalidade = LISTA_MODALIDADES_CACHE.find((m) => m.id === modalidadeId);

  document.getElementById("vista-lista").style.display = "none";
  document.getElementById("vista-historico").style.display = "block";
  document.getElementById("titulo-modalidade").textContent = nomeModalidade;
  document.getElementById("descricao-modalidade").textContent = modalidade?.descricao || "";

  if (EDICOES_MODALIDADE.length === 0) {
    const res = await fetch(`${API_BASE_URL}/api/edicoes`);
    EDICOES_MODALIDADE = await res.json();
  }

  const filtroEdicao = document.getElementById("filtro-edicao-modalidade");
  preencherFiltro(
    filtroEdicao,
    EDICOES_MODALIDADE.map((e) => ({ value: e.id, label: e.nome })),
    "Todas as edições (geral)"
  );
  filtroEdicao.value = "todos";

  // Busca todos os resultados desta modalidade para estatísticas gerais
  const resAll = await fetch(`${API_BASE_URL}/api/resultados?modalidade_id=${modalidadeId}`);
  const todosResultados = await resAll.json();

  const totalMedalhas = todosResultados.length;
  const alunosUnicos = new Set(todosResultados.map((r) => r.aluno.id)).size;
  const ouros = todosResultados.filter((r) => r.posicao === "1").length;
  const edicoesComResultado = new Set(todosResultados.map((r) => r.edicao.id)).size;

  document.getElementById("stats-modalidade").innerHTML = [
    { valor: totalMedalhas, label: "Medalhas", svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="15" r="5"/><path d="M9 11 6 3h2l4 6 4-6h2l-3 8"/></svg>` },
    { valor: alunosUnicos, label: "Alunos premiados", svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>` },
    { valor: ouros, label: "Medalhas de ouro", svg: `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>` },
    { valor: edicoesComResultado, label: "Edições disputadas", svg: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>` },
  ].map((s) => `
    <div class="stat-publica">
      <div class="stat-publica__icone">${s.svg}</div>
      <div>
        <span class="stat-publica__valor">${s.valor}</span>
        <span class="stat-publica__label">${s.label}</span>
      </div>
    </div>`).join("");

  atualizarHistorico();
}

function voltarParaLista() {
  document.getElementById("vista-lista").style.display = "block";
  document.getElementById("vista-historico").style.display = "none";
  modalidadeAtualId = null;
}

async function atualizarHistorico() {
  const edicao = document.getElementById("filtro-edicao-modalidade").value;

  try {
    const params = new URLSearchParams({ modalidade_id: modalidadeAtualId });
    if (edicao !== "todos") params.set("edicao_id", edicao);

    const res = await fetch(`${API_BASE_URL}/api/resultados?${params.toString()}`);
    const resultados = await res.json();

    renderPodioModalidade(resultados, edicao);
    renderTabelaModalidade(resultados);
  } catch (erro) {
    console.error("Erro ao carregar histórico da modalidade:", erro);
    document.getElementById("podio-modalidade").innerHTML = `<p style="color: var(--vermelho);">Não foi possível carregar o histórico.</p>`;
  }
}

function renderPodioModalidade(lista, edicao) {
  const container = document.getElementById("podio-modalidade");

  let top;
  if (edicao === "todos") {
    // Histórico geral: conta quantas vezes cada aluno ficou em 1º lugar
    const contagemOuro = {};
    const exemploPorAluno = {};
    lista.forEach((r) => {
      if (r.posicao === "1") {
        contagemOuro[r.aluno.nome] = (contagemOuro[r.aluno.nome] || 0) + 1;
        exemploPorAluno[r.aluno.nome] = r.aluno;
      }
    });
    const maisVitorias = Object.entries(contagemOuro).sort((a, b) => b[1] - a[1]);

    if (maisVitorias.length === 0) {
      container.innerHTML = `<p style="color: var(--texto-suave);">Ainda não há resultados registrados para esta modalidade.</p>`;
      return;
    }

    top = maisVitorias.slice(0, 3).map(([nome, vitorias], i) => ({
      posicao: i + 1,
      nome,
      foto: exemploPorAluno[nome].foto_url || "https://i.pravatar.cc/150?img=1",
      detalhe: `${vitorias} edição${vitorias === 1 ? "" : "s"} em 1º lugar`,
    }));
  } else {
    const mapaPosicao = { "1": 1, "2": 2, "3": 3 };
    const filtrado = lista.filter((r) => mapaPosicao[r.posicao]);

    if (filtrado.length === 0) {
      container.innerHTML = `<p style="color: var(--texto-suave);">Sem resultados para esta edição.</p>`;
      return;
    }

    top = filtrado.map((r) => ({
      posicao: mapaPosicao[r.posicao],
      nome: r.aluno.nome,
      foto: r.aluno.foto_url || "https://i.pravatar.cc/150?img=1",
      detalhe: `${r.aluno.turma.curso.nome} · ${r.edicao.ano}`,
    }));
  }

  const ordem = { 2: 0, 1: 1, 3: 2 };
  const ordenado = [...top].sort((a, b) => (ordem[a.posicao] ?? 9) - (ordem[b.posicao] ?? 9));

  container.innerHTML = ordenado
    .map(
      (item) => `
      <div class="podio__lugar podio__lugar--${item.posicao}">
        <div class="podio__foto-wrap">
          <img class="podio__foto" src="${item.foto}" alt="Foto de ${item.nome}" />
          <span class="podio__medalha">${item.posicao}º</span>
        </div>
        <div class="podio__bloco">
          <span class="podio__posicao">${item.posicao}º</span>
          <span class="podio__nome">${item.nome}</span>
          <span class="podio__detalhe">${item.detalhe}</span>
        </div>
      </div>`
    )
    .join("");
}

function renderTabelaModalidade(lista) {
  const corpo = document.getElementById("tabela-modalidade");

  if (lista.length === 0) {
    corpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--texto-suave); padding: 28px;">Nenhum resultado encontrado.</td></tr>`;
    return;
  }

  corpo.innerHTML = lista
    .map((r) => {
      const ehMh = r.posicao === "mh";
      const tagClasse = ehMh ? "tag-medalha--mh" : `tag-medalha--${r.posicao}`;
      const tagTexto = ehMh ? "MH" : `${r.posicao}º`;
      return `
      <tr>
        <td><span class="tag-medalha ${tagClasse}">${tagTexto}</span></td>
        <td>${r.aluno.nome}${linkPerfil(r.aluno.id)}</td>
        <td>${r.aluno.turma.nome}</td>
        <td>${r.aluno.turma.curso.nome}</td>
        <td>${r.edicao.ano}</td>
      </tr>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderListaModalidades();

  document.getElementById("link-voltar").addEventListener("click", (e) => {
    e.preventDefault();
    voltarParaLista();
  });

  document.getElementById("filtro-edicao-modalidade").addEventListener("change", atualizarHistorico);
});
