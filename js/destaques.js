/* =========================================================
   Destaques — filtros (edição, categoria) + grid de cards
   (dados reais da API)
   ========================================================= */

const CATEGORIAS_DESTAQUE = [
  { value: "geral", label: "Destaque geral" },
  { value: "turma", label: "Destaque de turma" },
  { value: "curso", label: "Destaque de curso" },
  { value: "ano", label: "Destaque de ano/série" },
];

const LABEL_CATEGORIA_DESTAQUE = {
  geral: "Destaque geral",
  turma: "Destaque de turma",
  curso: "Destaque de curso",
  ano: "Destaque de ano/série",
};

async function inicializarFiltrosDestaques() {
  const res = await fetch(`${API_BASE_URL}/api/edicoes`);
  const edicoes = await res.json();

  preencherFiltro(
    document.getElementById("filtro-edicao-destaque"),
    edicoes.map((e) => ({ value: e.id, label: e.nome })),
    "Todas as edições"
  );
  preencherFiltro(document.getElementById("filtro-categoria-destaque"), CATEGORIAS_DESTAQUE, "Todas as categorias");
}

async function buscarDestaques() {
  const edicao = document.getElementById("filtro-edicao-destaque").value;
  const categoria = document.getElementById("filtro-categoria-destaque").value;

  const params = new URLSearchParams();
  if (edicao !== "todos") params.set("edicao_id", edicao);
  if (categoria !== "todos") params.set("categoria", categoria);

  const res = await fetch(`${API_BASE_URL}/api/destaques?${params.toString()}`);
  return res.json();
}

function renderDestaques(lista) {
  const container = document.getElementById("lista-destaques");
  const contagem = document.getElementById("contagem-destaques");
  contagem.textContent = `${lista.length} resultado${lista.length === 1 ? "" : "s"}`;

  if (lista.length === 0) {
    container.innerHTML = `<p style="color: var(--texto-suave); grid-column: 1 / -1; text-align:center; padding: 28px;">Nenhum destaque encontrado para os filtros selecionados.</p>`;
    return;
  }

  container.innerHTML = lista
    .map(
      (d) => `
      <div class="destaque-card">
        <img class="destaque-card__foto" src="${d.aluno.foto_url || 'https://i.pravatar.cc/100?img=1'}" alt="Foto de ${d.aluno.nome}" />
        <div class="destaque-card__corpo">
          <span class="destaque-card__categoria">${LABEL_CATEGORIA_DESTAQUE[d.categoria] || d.categoria}</span>
          <h3>${d.aluno.nome}${linkPerfil(d.aluno.id)}</h3>
          <p>${d.descricao}</p>
        </div>
      </div>`
    )
    .join("");
}

async function atualizarDestaques() {
  try {
    const lista = await buscarDestaques();
    renderDestaques(lista);
  } catch (erro) {
    console.error("Erro ao buscar destaques:", erro);
    document.getElementById("lista-destaques").innerHTML =
      `<p style="color: var(--vermelho); grid-column: 1 / -1; text-align:center; padding: 28px;">Não foi possível carregar os destaques. Verifique se a API está rodando.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await inicializarFiltrosDestaques();
    await atualizarDestaques();

    document
      .querySelectorAll("#filtros-destaques select")
      .forEach((select) => select.addEventListener("change", atualizarDestaques));
  } catch (erro) {
    console.error("Erro ao iniciar página de destaques:", erro);
  }
});
