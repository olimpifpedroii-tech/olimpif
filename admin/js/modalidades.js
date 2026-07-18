/* =========================================================
   Admin — Modalidades (dados reais da API)
   ========================================================= */

let MODALIDADES_CACHE = [];
let modalidadeEmEdicao = null;
let modalidadeParaExcluir = null;

async function renderTabelaModalidades() {
  const corpo = document.getElementById("tabela-modalidades");

  try {
    const res = await fetch(`${API_BASE_URL}/api/modalidades`);
    MODALIDADES_CACHE = await res.json();

    if (MODALIDADES_CACHE.length === 0) {
      corpo.innerHTML = `
        <tr><td colspan="3">
          <div class="estado-vazio">
            ${ICONES.modalidade.replace("<svg ", '<svg style="width:40px;height:40px;stroke:var(--cinza-borda);" ')}
            <strong>Nenhuma modalidade cadastrada</strong>
            <p>Clique em "Nova modalidade" para começar.</p>
          </div>
        </td></tr>`;
      return;
    }

    corpo.innerHTML = MODALIDADES_CACHE
      .map(
        (m) => `
        <tr>
          <td>${m.nome}</td>
          <td>${m.descricao || "—"}</td>
          <td>
            <button class="acao-btn" title="Editar" data-editar="${m.id}">${ICONES.editar}</button>
            <button class="acao-btn acao-btn--excluir" title="Excluir" data-excluir="${m.id}">${ICONES.excluir}</button>
          </td>
        </tr>`
      )
      .join("");

    corpo.querySelectorAll("[data-editar]").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalModalidade(Number(btn.dataset.editar)));
    });

    corpo.querySelectorAll("[data-excluir]").forEach((btn) => {
      btn.addEventListener("click", () => abrirExclusaoModalidade(Number(btn.dataset.excluir)));
    });
  } catch (erro) {
    console.error("Erro ao buscar modalidades:", erro);
    corpo.innerHTML = `<tr><td colspan="3" style="text-align:center; color: var(--vermelho); padding: 28px;">Não foi possível carregar as modalidades.</td></tr>`;
  }
}

function abrirModalModalidade(id = null) {
  modalidadeEmEdicao = id;
  const titulo = document.getElementById("titulo-modal-modalidade");
  const form = document.getElementById("form-modalidade");
  form.reset();

  if (id) {
    const m = MODALIDADES_CACHE.find((x) => x.id === id);
    titulo.textContent = "Editar modalidade";
    document.getElementById("campo-nome-modalidade").value = m.nome;
    document.getElementById("campo-descricao-modalidade").value = m.descricao || "";
  } else {
    titulo.textContent = "Nova modalidade";
  }

  abrirModal("modal-modalidade");
}

async function salvarModalidade(e) {
  e.preventDefault();
  const nome = document.getElementById("campo-nome-modalidade").value.trim();
  const descricao = document.getElementById("campo-descricao-modalidade").value.trim();

  const botaoSalvar = e.target.querySelector("button[type=submit]");
  botaoSalvar.disabled = true;

  try {
    const url = modalidadeEmEdicao
      ? `${API_BASE_URL}/api/modalidades/${modalidadeEmEdicao}`
      : `${API_BASE_URL}/api/modalidades`;
    const metodo = modalidadeEmEdicao ? "PUT" : "POST";

    const res = await fetchAutenticado(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, descricao }),
    });

    if (!res.ok) {
      const erroBody = await res.json().catch(() => ({}));
      throw new Error(erroBody.detail || "Falha ao salvar modalidade.");
    }

    mostrarToast(modalidadeEmEdicao ? "Modalidade atualizada com sucesso." : "Modalidade cadastrada com sucesso.");
    fecharModal("modal-modalidade");
    await renderTabelaModalidades();
  } catch (erro) {
    console.error("Erro ao salvar modalidade:", erro);
    alert(erro.message || "Não foi possível salvar a modalidade.");
  } finally {
    botaoSalvar.disabled = false;
  }
}

function abrirExclusaoModalidade(id) {
  modalidadeParaExcluir = id;
  const m = MODALIDADES_CACHE.find((x) => x.id === id);
  document.getElementById("texto-excluir-modalidade").textContent =
    `Tem certeza que deseja excluir "${m.nome}"? Resultados vinculados a esta modalidade também serão afetados.`;
  abrirModal("modal-excluir-modalidade");
}

async function confirmarExclusaoModalidade() {
  try {
    const res = await fetchAutenticado(`${API_BASE_URL}/api/modalidades/${modalidadeParaExcluir}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Falha ao excluir modalidade.");

    fecharModal("modal-excluir-modalidade");
    await renderTabelaModalidades();
    mostrarToast("Modalidade excluída.");
  } catch (erro) {
    console.error("Erro ao excluir modalidade:", erro);
    alert("Não foi possível excluir a modalidade.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderTabelaModalidades();
  configurarFechamentoModal("modal-modalidade");
  configurarFechamentoModal("modal-excluir-modalidade");

  document.getElementById("botao-nova-modalidade").addEventListener("click", () => abrirModalModalidade());
  document.getElementById("form-modalidade").addEventListener("submit", salvarModalidade);
  document.getElementById("confirmar-exclusao-modalidade").addEventListener("click", confirmarExclusaoModalidade);
});
