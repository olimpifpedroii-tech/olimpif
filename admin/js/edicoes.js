/* =========================================================
   Admin — Edições (dados reais da API)
   ========================================================= */

let EDICOES_CACHE = [];
let edicaoEmEdicao = null;
let edicaoParaExcluir = null;

async function renderTabelaEdicoesAdmin() {
  const corpo = document.getElementById("tabela-edicoes-admin");

  try {
    const res = await fetch(`${API_BASE_URL}/api/edicoes`);
    EDICOES_CACHE = await res.json();

    if (EDICOES_CACHE.length === 0) {
      corpo.innerHTML = `
        <tr><td colspan="4">
          <div class="estado-vazio">
            ${ICONES.edicao.replace("<svg ", '<svg style="width:40px;height:40px;stroke:var(--cinza-borda);" ')}
            <strong>Nenhuma edição cadastrada</strong>
            <p>Clique em "Nova edição" para começar.</p>
          </div>
        </td></tr>`;
      return;
    }

    // A API já retorna ordenado por ano desc
    corpo.innerHTML = EDICOES_CACHE
      .map(
        (e) => `
        <tr>
          <td>${e.nome}</td>
          <td>${e.ano}</td>
          <td>${e.data}</td>
          <td>
            <button class="acao-btn" title="Editar" data-editar="${e.id}">${ICONES.editar}</button>
            <button class="acao-btn acao-btn--excluir" title="Excluir" data-excluir="${e.id}">${ICONES.excluir}</button>
          </td>
        </tr>`
      )
      .join("");

    corpo.querySelectorAll("[data-editar]").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalEdicao(Number(btn.dataset.editar)));
    });

    corpo.querySelectorAll("[data-excluir]").forEach((btn) => {
      btn.addEventListener("click", () => abrirExclusaoEdicao(Number(btn.dataset.excluir)));
    });
  } catch (erro) {
    console.error("Erro ao buscar edições:", erro);
    corpo.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--vermelho); padding: 28px;">Não foi possível carregar as edições.</td></tr>`;
  }
}

function abrirModalEdicao(id = null) {
  edicaoEmEdicao = id;
  const titulo = document.getElementById("titulo-modal-edicao");
  const form = document.getElementById("form-edicao");
  form.reset();

  if (id) {
    const e = EDICOES_CACHE.find((x) => x.id === id);
    titulo.textContent = "Editar edição";
    document.getElementById("campo-nome-edicao").value = e.nome;
    document.getElementById("campo-ano-edicao").value = e.ano;
    document.getElementById("campo-data-edicao").value = e.data;
  } else {
    titulo.textContent = "Nova edição";
  }

  abrirModal("modal-edicao");
}

async function salvarEdicao(e) {
  e.preventDefault();

  const nome = document.getElementById("campo-nome-edicao").value.trim();
  const ano = Number(document.getElementById("campo-ano-edicao").value);
  const data = document.getElementById("campo-data-edicao").value.trim();

  const botaoSalvar = e.target.querySelector("button[type=submit]");
  botaoSalvar.disabled = true;

  try {
    const url = edicaoEmEdicao ? `${API_BASE_URL}/api/edicoes/${edicaoEmEdicao}` : `${API_BASE_URL}/api/edicoes`;
    const metodo = edicaoEmEdicao ? "PUT" : "POST";

    const res = await fetchAutenticado(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, ano, data }),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({}));
      throw new Error(erroBody.detail || "Falha ao salvar edição.");
    }

    mostrarToast(edicaoEmEdicao ? "Edição atualizada com sucesso." : "Edição cadastrada com sucesso.");
    fecharModal("modal-edicao");
    await renderTabelaEdicoesAdmin();
  } catch (erro) {
    console.error("Erro ao salvar edição:", erro);
    alert(erro.message || "Não foi possível salvar a edição.");
  } finally {
    botaoSalvar.disabled = false;
  }
}

function abrirExclusaoEdicao(id) {
  edicaoParaExcluir = id;
  const e = EDICOES_CACHE.find((x) => x.id === id);
  document.getElementById("texto-excluir-edicao").textContent =
    `Tem certeza que deseja excluir "${e.nome}"? Todos os resultados e destaques vinculados a esta edição também serão afetados.`;
  abrirModal("modal-excluir-edicao");
}

async function confirmarExclusaoEdicao() {
  try {
    const res = await fetchAutenticado(`${API_BASE_URL}/api/edicoes/${edicaoParaExcluir}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Falha ao excluir edição.");

    fecharModal("modal-excluir-edicao");
    await renderTabelaEdicoesAdmin();
    mostrarToast("Edição excluída.");
  } catch (erro) {
    console.error("Erro ao excluir edição:", erro);
    alert("Não foi possível excluir a edição.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderTabelaEdicoesAdmin();
  configurarFechamentoModal("modal-edicao");
  configurarFechamentoModal("modal-excluir-edicao");

  document.getElementById("botao-nova-edicao").addEventListener("click", () => abrirModalEdicao());
  document.getElementById("form-edicao").addEventListener("submit", salvarEdicao);
  document.getElementById("confirmar-exclusao-edicao").addEventListener("click", confirmarExclusaoEdicao);
});
