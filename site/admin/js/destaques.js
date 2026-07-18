/* =========================================================
   Admin — Destaques (dados reais da API)
   ========================================================= */

let ALUNOS_DESTAQUE = [];
let EDICOES_DESTAQUE_ADMIN = [];
let DESTAQUES_CACHE = [];

const CATEGORIAS_DESTAQUE_ADMIN = [
  { value: "geral", label: "Destaque geral" },
  { value: "turma", label: "Destaque de turma" },
  { value: "curso", label: "Destaque de curso" },
  { value: "ano", label: "Destaque de ano/série" },
];

const LABEL_CATEGORIA_ADMIN = {
  geral: "Destaque geral",
  turma: "Destaque de turma",
  curso: "Destaque de curso",
  ano: "Destaque de ano/série",
};

let destaqueEmEdicao = null;
let destaqueParaExcluir = null;

async function carregarListasDestaque() {
  const [alunosRes, edicoesRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/alunos`),
    fetch(`${API_BASE_URL}/api/edicoes`),
  ]);
  ALUNOS_DESTAQUE = await alunosRes.json();
  EDICOES_DESTAQUE_ADMIN = await edicoesRes.json();
}

function inicializarFiltrosDestaquesAdmin() {
  preencherFiltro(
    document.getElementById("filtro-edicao-destaque-admin"),
    EDICOES_DESTAQUE_ADMIN.map((e) => ({ value: e.id, label: e.nome })),
    "Todas as edições"
  );
  preencherFiltro(document.getElementById("filtro-categoria-destaque-admin"), CATEGORIAS_DESTAQUE_ADMIN, "Todas as categorias");
}

function inicializarSelectsDestaque() {
  document.getElementById("campo-aluno-destaque").innerHTML = ALUNOS_DESTAQUE
    .map((a) => `<option value="${a.id}">${a.nome}</option>`)
    .join("");
  document.getElementById("campo-edicao-destaque").innerHTML = EDICOES_DESTAQUE_ADMIN
    .map((e) => `<option value="${e.id}">${e.nome}</option>`)
    .join("");
}

async function buscarDestaquesFiltrados() {
  const edicao = document.getElementById("filtro-edicao-destaque-admin").value;
  const categoria = document.getElementById("filtro-categoria-destaque-admin").value;

  const params = new URLSearchParams();
  if (edicao !== "todos") params.set("edicao_id", edicao);
  if (categoria !== "todos") params.set("categoria", categoria);

  const res = await fetch(`${API_BASE_URL}/api/destaques?${params.toString()}`);
  return res.json();
}

async function renderTabelaDestaquesAdmin() {
  const corpo = document.getElementById("tabela-destaques-admin");

  try {
    const lista = await buscarDestaquesFiltrados();
    DESTAQUES_CACHE = lista;

    if (lista.length === 0) {
      corpo.innerHTML = `
        <tr><td colspan="5">
          <div class="estado-vazio">
            ${ICONES.destaque.replace("<svg ", '<svg style="width:40px;height:40px;stroke:var(--cinza-borda);" ')}
            <strong>Nenhum destaque encontrado</strong>
            <p>Ajuste os filtros ou cadastre um novo destaque.</p>
          </div>
        </td></tr>`;
      return;
    }

    corpo.innerHTML = lista
      .map(
        (d) => `
        <tr>
          <td>${d.aluno.nome}</td>
          <td>${LABEL_CATEGORIA_ADMIN[d.categoria] || d.categoria}</td>
          <td>${d.edicao.nome}</td>
          <td style="max-width: 320px; white-space: normal;">${d.descricao}</td>
          <td>
            <button class="acao-btn" title="Editar" data-editar="${d.id}">${ICONES.editar}</button>
            <button class="acao-btn acao-btn--excluir" title="Excluir" data-excluir="${d.id}">${ICONES.excluir}</button>
          </td>
        </tr>`
      )
      .join("");

    corpo.querySelectorAll("[data-editar]").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalDestaque(Number(btn.dataset.editar)));
    });

    corpo.querySelectorAll("[data-excluir]").forEach((btn) => {
      btn.addEventListener("click", () => abrirExclusaoDestaque(Number(btn.dataset.excluir)));
    });
  } catch (erro) {
    console.error("Erro ao buscar destaques:", erro);
    corpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--vermelho); padding: 28px;">Não foi possível carregar os destaques.</td></tr>`;
  }
}

function abrirModalDestaque(id = null) {
  destaqueEmEdicao = id;
  const titulo = document.getElementById("titulo-modal-destaque");
  const form = document.getElementById("form-destaque");
  form.reset();

  if (id) {
    const d = DESTAQUES_CACHE.find((x) => x.id === id);
    titulo.textContent = "Editar destaque";
    document.getElementById("campo-aluno-destaque").value = d.aluno.id;
    document.getElementById("campo-categoria-destaque").value = d.categoria;
    document.getElementById("campo-edicao-destaque").value = d.edicao.id;
    document.getElementById("campo-descricao-destaque").value = d.descricao;
  } else {
    titulo.textContent = "Novo destaque";
  }

  abrirModal("modal-destaque");
}

async function salvarDestaque(e) {
  e.preventDefault();

  const aluno_id = Number(document.getElementById("campo-aluno-destaque").value);
  const categoria = document.getElementById("campo-categoria-destaque").value;
  const edicao_id = Number(document.getElementById("campo-edicao-destaque").value);
  const descricao = document.getElementById("campo-descricao-destaque").value.trim();

  const botaoSalvar = e.target.querySelector("button[type=submit]");
  botaoSalvar.disabled = true;

  try {
    const url = destaqueEmEdicao
      ? `${API_BASE_URL}/api/destaques/${destaqueEmEdicao}`
      : `${API_BASE_URL}/api/destaques`;
    const metodo = destaqueEmEdicao ? "PUT" : "POST";

    const res = await fetchAutenticado(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aluno_id, categoria, edicao_id, descricao }),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({}));
      throw new Error(erroBody.detail || "Falha ao salvar destaque.");
    }

    mostrarToast(destaqueEmEdicao ? "Destaque atualizado com sucesso." : "Destaque cadastrado com sucesso.");
    fecharModal("modal-destaque");
    await renderTabelaDestaquesAdmin();
  } catch (erro) {
    console.error("Erro ao salvar destaque:", erro);
    alert(erro.message || "Não foi possível salvar o destaque.");
  } finally {
    botaoSalvar.disabled = false;
  }
}

function abrirExclusaoDestaque(id) {
  destaqueParaExcluir = id;
  const d = DESTAQUES_CACHE.find((x) => x.id === id);
  document.getElementById("texto-excluir-destaque").textContent =
    `Tem certeza que deseja excluir o destaque de "${d.aluno.nome}"?`;
  abrirModal("modal-excluir-destaque");
}

async function confirmarExclusaoDestaque() {
  try {
    const res = await fetchAutenticado(`${API_BASE_URL}/api/destaques/${destaqueParaExcluir}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Falha ao excluir destaque.");

    fecharModal("modal-excluir-destaque");
    await renderTabelaDestaquesAdmin();
    mostrarToast("Destaque excluído.");
  } catch (erro) {
    console.error("Erro ao excluir destaque:", erro);
    alert("Não foi possível excluir o destaque.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await carregarListasDestaque();
    inicializarFiltrosDestaquesAdmin();
    inicializarSelectsDestaque();
    await renderTabelaDestaquesAdmin();
  } catch (erro) {
    console.error("Erro ao iniciar página de destaques:", erro);
  }

  configurarFechamentoModal("modal-destaque");
  configurarFechamentoModal("modal-excluir-destaque");

  document.getElementById("botao-novo-destaque").addEventListener("click", () => abrirModalDestaque());
  document.getElementById("form-destaque").addEventListener("submit", salvarDestaque);
  document.getElementById("confirmar-exclusao-destaque").addEventListener("click", confirmarExclusaoDestaque);

  document
    .querySelectorAll("#filtros-destaques-admin select")
    .forEach((select) => select.addEventListener("change", renderTabelaDestaquesAdmin));
});
