/* =========================================================
   Admin — Resultados (medalhas) (dados reais da API)
   ========================================================= */

let ALUNOS_RESULTADO = [];
let MODALIDADES_RESULTADO = [];
let EDICOES_RESULTADO = [];
let RESULTADOS_CACHE = [];

let resultadoEmEdicao = null;
let resultadoParaExcluir = null;

async function carregarListasResultado() {
  const [alunosRes, modalidadesRes, edicoesRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/alunos`),
    fetch(`${API_BASE_URL}/api/modalidades`),
    fetch(`${API_BASE_URL}/api/edicoes`),
  ]);
  ALUNOS_RESULTADO = await alunosRes.json();
  MODALIDADES_RESULTADO = await modalidadesRes.json();
  EDICOES_RESULTADO = await edicoesRes.json();
}

function inicializarFiltrosResultados() {
  preencherFiltro(
    document.getElementById("filtro-edicao-resultado"),
    EDICOES_RESULTADO.map((e) => ({ value: e.id, label: e.nome })),
    "Todas as edições"
  );
  preencherFiltro(
    document.getElementById("filtro-modalidade-resultado"),
    MODALIDADES_RESULTADO.map((m) => ({ value: m.id, label: m.nome })),
    "Todas as modalidades"
  );
}

function inicializarSelectsResultado() {
  document.getElementById("campo-aluno-resultado").innerHTML = ALUNOS_RESULTADO
    .map((a) => `<option value="${a.id}">${a.nome}</option>`)
    .join("");
  document.getElementById("campo-modalidade-resultado").innerHTML = MODALIDADES_RESULTADO
    .map((m) => `<option value="${m.id}">${m.nome}</option>`)
    .join("");
  document.getElementById("campo-edicao-resultado").innerHTML = EDICOES_RESULTADO
    .map((e) => `<option value="${e.id}">${e.nome}</option>`)
    .join("");
}

async function buscarResultadosFiltrados() {
  const edicao = document.getElementById("filtro-edicao-resultado").value;
  const modalidade = document.getElementById("filtro-modalidade-resultado").value;

  const params = new URLSearchParams();
  if (edicao !== "todos") params.set("edicao_id", edicao);
  if (modalidade !== "todos") params.set("modalidade_id", modalidade);

  const res = await fetch(`${API_BASE_URL}/api/resultados?${params.toString()}`);
  return res.json();
}

async function renderTabelaResultados() {
  const corpo = document.getElementById("tabela-resultados");

  try {
    const lista = await buscarResultadosFiltrados();
    RESULTADOS_CACHE = lista;

    if (lista.length === 0) {
      corpo.innerHTML = `
        <tr><td colspan="5">
          <div class="estado-vazio">
            ${ICONES.medalha.replace("<svg ", '<svg style="width:40px;height:40px;stroke:var(--cinza-borda);" ')}
            <strong>Nenhum resultado encontrado</strong>
            <p>Ajuste os filtros ou cadastre um novo resultado.</p>
          </div>
        </td></tr>`;
      return;
    }

    const pesoPosicao = { "1": 1, "2": 2, "3": 3, mh: 4 };
    const ordenado = [...lista].sort((a, b) => {
      if (a.edicao.id !== b.edicao.id) return b.edicao.ano - a.edicao.ano;
      if (a.modalidade.id !== b.modalidade.id) return a.modalidade.nome.localeCompare(b.modalidade.nome);
      return pesoPosicao[a.posicao] - pesoPosicao[b.posicao];
    });

    corpo.innerHTML = ordenado
      .map((r) => {
        const ehMh = r.posicao === "mh";
        const tagClasse = ehMh ? "tag-medalha--mh" : `tag-medalha--${r.posicao}`;
        const tagTexto = ehMh ? "MH" : `${r.posicao}º`;
        return `
        <tr>
          <td><span class="tag-medalha ${tagClasse}">${tagTexto}</span></td>
          <td>${r.aluno.nome}</td>
          <td>${r.modalidade.nome}</td>
          <td>${r.edicao.nome}</td>
          <td>
            <button class="acao-btn" title="Editar" data-editar="${r.id}">${ICONES.editar}</button>
            <button class="acao-btn acao-btn--excluir" title="Excluir" data-excluir="${r.id}">${ICONES.excluir}</button>
          </td>
        </tr>`;
      })
      .join("");

    corpo.querySelectorAll("[data-editar]").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalResultado(Number(btn.dataset.editar)));
    });

    corpo.querySelectorAll("[data-excluir]").forEach((btn) => {
      btn.addEventListener("click", () => abrirExclusaoResultado(Number(btn.dataset.excluir)));
    });
  } catch (erro) {
    console.error("Erro ao buscar resultados:", erro);
    corpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--vermelho); padding: 28px;">Não foi possível carregar os resultados.</td></tr>`;
  }
}

function abrirModalResultado(id = null) {
  resultadoEmEdicao = id;
  const titulo = document.getElementById("titulo-modal-resultado");
  const form = document.getElementById("form-resultado");
  form.reset();

  if (id) {
    const r = RESULTADOS_CACHE.find((x) => x.id === id);
    titulo.textContent = "Editar resultado";
    document.getElementById("campo-aluno-resultado").value = r.aluno.id;
    document.getElementById("campo-modalidade-resultado").value = r.modalidade.id;
    document.getElementById("campo-edicao-resultado").value = r.edicao.id;
    document.getElementById("campo-posicao-resultado").value = r.posicao;
  } else {
    titulo.textContent = "Novo resultado";
  }

  abrirModal("modal-resultado");
}

async function salvarResultado(e) {
  e.preventDefault();

  const aluno_id = Number(document.getElementById("campo-aluno-resultado").value);
  const modalidade_id = Number(document.getElementById("campo-modalidade-resultado").value);
  const edicao_id = Number(document.getElementById("campo-edicao-resultado").value);
  const posicao = document.getElementById("campo-posicao-resultado").value;

  const botaoSalvar = e.target.querySelector("button[type=submit]");
  botaoSalvar.disabled = true;

  try {
    const url = resultadoEmEdicao
      ? `${API_BASE_URL}/api/resultados/${resultadoEmEdicao}`
      : `${API_BASE_URL}/api/resultados`;
    const metodo = resultadoEmEdicao ? "PUT" : "POST";

    const res = await fetchAutenticado(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aluno_id, modalidade_id, edicao_id, posicao }),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({}));
      throw new Error(erroBody.detail || "Falha ao salvar resultado.");
    }

    mostrarToast(resultadoEmEdicao ? "Resultado atualizado com sucesso." : "Resultado cadastrado com sucesso.");
    fecharModal("modal-resultado");
    await renderTabelaResultados();
  } catch (erro) {
    console.error("Erro ao salvar resultado:", erro);
    alert(erro.message || "Não foi possível salvar o resultado.");
  } finally {
    botaoSalvar.disabled = false;
  }
}

function abrirExclusaoResultado(id) {
  resultadoParaExcluir = id;
  const r = RESULTADOS_CACHE.find((x) => x.id === id);
  const posicaoTexto = r.posicao === "mh" ? "Menção Honrosa" : `${r.posicao}º lugar`;
  document.getElementById("texto-excluir-resultado").textContent =
    `Tem certeza que deseja excluir o resultado de "${r.aluno.nome}" (${posicaoTexto} em ${r.modalidade.nome})?`;
  abrirModal("modal-excluir-resultado");
}

async function confirmarExclusaoResultado() {
  try {
    const res = await fetchAutenticado(`${API_BASE_URL}/api/resultados/${resultadoParaExcluir}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Falha ao excluir resultado.");

    fecharModal("modal-excluir-resultado");
    await renderTabelaResultados();
    mostrarToast("Resultado excluído.");
  } catch (erro) {
    console.error("Erro ao excluir resultado:", erro);
    alert("Não foi possível excluir o resultado.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await carregarListasResultado();
    inicializarFiltrosResultados();
    inicializarSelectsResultado();
    await renderTabelaResultados();
  } catch (erro) {
    console.error("Erro ao iniciar página de resultados:", erro);
  }

  configurarFechamentoModal("modal-resultado");
  configurarFechamentoModal("modal-excluir-resultado");

  document.getElementById("botao-novo-resultado").addEventListener("click", () => abrirModalResultado());
  document.getElementById("form-resultado").addEventListener("submit", salvarResultado);
  document.getElementById("confirmar-exclusao-resultado").addEventListener("click", confirmarExclusaoResultado);

  document
    .querySelectorAll("#filtros-resultados select")
    .forEach((select) => select.addEventListener("change", renderTabelaResultados));
});
