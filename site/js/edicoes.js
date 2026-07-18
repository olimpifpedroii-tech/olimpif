/* =========================================================
   Edições — lista geral e resumo por edição
   (dados reais da API)
   ========================================================= */

const LABEL_CATEGORIA_EDICAO = {
  geral: "Destaque geral",
  turma: "Destaque de turma",
  curso: "Destaque de curso",
  ano: "Destaque de ano/série",
};

async function renderListaEdicoes() {
  const container = document.getElementById("lista-edicoes");

  try {
    const res = await fetch(`${API_BASE_URL}/api/edicoes`);
    const edicoes = await res.json();

    if (edicoes.length === 0) {
      container.innerHTML = `<p style="color: var(--texto-suave);">Nenhuma edição cadastrada ainda.</p>`;
      return;
    }

    container.innerHTML = edicoes
      .map(
        (e) => `
      <a class="card-item" href="#" data-edicao="${e.id}">
        <div class="card-item__icon">
          <svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>
        </div>
        <h3>${e.nome}</h3>
        <p>${e.data}</p>
        <span class="card-item__meta">Ver resumo →</span>
      </a>`
      )
      .join("");

    container.querySelectorAll("[data-edicao]").forEach((card) => {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        const edicao = edicoes.find((x) => x.id === Number(card.dataset.edicao));
        abrirResumo(edicao);
      });
    });
  } catch (erro) {
    console.error("Erro ao carregar edições:", erro);
    container.innerHTML = `<p style="color: var(--vermelho);">Não foi possível carregar as edições. Verifique se a API está rodando.</p>`;
  }
}

async function abrirResumo(edicao) {
  document.getElementById("vista-lista-edicoes").style.display = "none";
  document.getElementById("vista-resumo-edicao").style.display = "block";

  document.getElementById("ano-edicao").textContent = `Edição ${edicao.ano}`;
  document.getElementById("titulo-edicao").textContent = edicao.nome;
  document.getElementById("descricao-edicao").textContent = `Confira o pódio geral, destaques e top medalhistas desta edição.`;

  try {
    const [rankingRes, destaquesRes, resultadosRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/ranking?edicao_id=${edicao.id}`),
      fetch(`${API_BASE_URL}/api/destaques?edicao_id=${edicao.id}`),
      fetch(`${API_BASE_URL}/api/resultados?edicao_id=${edicao.id}`),
    ]);

    const ranking = await rankingRes.json();
    const destaques = await destaquesRes.json();
    const resultados = await resultadosRes.json();

    renderPodioEdicao(ranking.slice(0, 3));
    renderDestaquesEdicao(destaques.slice(0, 4));
    renderTabelaEdicao(resultados);
  } catch (erro) {
    console.error("Erro ao carregar resumo da edição:", erro);
  }
}

function voltarParaListaEdicoes() {
  document.getElementById("vista-lista-edicoes").style.display = "block";
  document.getElementById("vista-resumo-edicao").style.display = "none";
}

function renderPodioEdicao(top3) {
  const container = document.getElementById("podio-edicao");

  if (top3.length === 0) {
    container.innerHTML = `<p style="color: var(--texto-suave);">Ainda não há resultados cadastrados para esta edição.</p>`;
    return;
  }

  const comPosicao = top3.map((item, indice) => ({ ...item, posicao: indice + 1 }));
  const ordem = { 2: 0, 1: 1, 3: 2 };
  const ordenado = [...comPosicao].sort((a, b) => ordem[a.posicao] - ordem[b.posicao]);

  container.innerHTML = ordenado
    .map(
      (item) => `
      <div class="podio__lugar podio__lugar--${item.posicao}">
        <div class="podio__foto-wrap">
          <img class="podio__foto" src="${item.foto_url || 'https://i.pravatar.cc/150?img=1'}" alt="Foto de ${item.nome}" />
          <span class="podio__medalha">${item.posicao}º</span>
        </div>
        <div class="podio__bloco">
          <span class="podio__posicao">${item.posicao}º</span>
          <span class="podio__nome">${item.nome}</span>
          <span class="podio__detalhe">${item.total} medalha${item.total === 1 ? "" : "s"}</span>
        </div>
      </div>`
    )
    .join("");
}

function renderDestaquesEdicao(lista) {
  const container = document.getElementById("destaques-edicao");

  if (lista.length === 0) {
    container.innerHTML = `<p style="color: var(--texto-suave); grid-column: 1 / -1;">Nenhum destaque registrado para esta edição.</p>`;
    return;
  }

  container.innerHTML = lista
    .map(
      (d) => `
      <div class="destaque-card">
        <img class="destaque-card__foto" src="${d.aluno.foto_url || 'https://i.pravatar.cc/100?img=1'}" alt="Foto de ${d.aluno.nome}" />
        <div class="destaque-card__corpo">
          <span class="destaque-card__categoria">${LABEL_CATEGORIA_EDICAO[d.categoria] || d.categoria}</span>
          <h3>${d.aluno.nome}${linkPerfil(d.aluno.id)}</h3>
          <p>${d.descricao}</p>
        </div>
      </div>`
    )
    .join("");
}

function renderTabelaEdicao(lista) {
  const corpo = document.getElementById("tabela-edicao");

  if (lista.length === 0) {
    corpo.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--texto-suave); padding: 28px;">Nenhum resultado cadastrado.</td></tr>`;
    return;
  }

  corpo.innerHTML = lista
    .map((r) => {
      const ehMh = r.posicao === "mh";
      const tagTexto = ehMh ? "MH" : `${r.posicao}º`;
      return `
      <tr>
        <td><span class="tag-medalha ${ehMh ? "tag-medalha--mh" : `tag-medalha--${r.posicao}`}">${tagTexto}</span></td>
        <td>${r.aluno.nome}${linkPerfil(r.aluno.id)}</td>
        <td>${r.aluno.turma.nome}</td>
        <td>${r.modalidade.nome}</td>
      </tr>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderListaEdicoes();

  document.getElementById("link-voltar-edicoes").addEventListener("click", (e) => {
    e.preventDefault();
    voltarParaListaEdicoes();
  });
});
