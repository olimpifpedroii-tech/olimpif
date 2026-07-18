/* =========================================================
   Admin — Alunos (dados reais da API)
   ========================================================= */

let CURSOS_ALUNO = [];
let TURMAS_ALUNO = [];
let ALUNOS_CACHE = [];

let alunoEmEdicao = null;
let alunoParaExcluir = null;
let arquivoFotoSelecionado = null;

async function carregarListasBase() {
  const [cursosRes, turmasRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/cursos`),
    fetch(`${API_BASE_URL}/api/turmas`),
  ]);
  CURSOS_ALUNO = await cursosRes.json();
  TURMAS_ALUNO = await turmasRes.json();
}

function inicializarFiltrosAlunos() {
  preencherFiltro(
    document.getElementById("filtro-curso-aluno"),
    CURSOS_ALUNO.map((c) => ({ value: c.id, label: c.nome })),
    "Todos os cursos"
  );
  preencherFiltro(
    document.getElementById("filtro-turma-aluno"),
    TURMAS_ALUNO.map((t) => ({ value: t.id, label: t.nome })),
    "Todas as turmas"
  );
}

function inicializarSelectsModal() {
  document.getElementById("campo-curso-aluno").innerHTML = CURSOS_ALUNO
    .map((c) => `<option value="${c.id}">${c.nome}</option>`)
    .join("");
  atualizarTurmasDoModal();

  document.getElementById("campo-curso-aluno").addEventListener("change", atualizarTurmasDoModal);
  document.getElementById("campo-ano-aluno").addEventListener("change", atualizarTurmasDoModal);
}

function atualizarTurmasDoModal() {
  const cursoId = Number(document.getElementById("campo-curso-aluno").value);
  const anoSerie = Number(document.getElementById("campo-ano-aluno").value);
  const select = document.getElementById("campo-turma-aluno");

  const turmasFiltradas = TURMAS_ALUNO.filter((t) => t.curso_id === cursoId && t.ano_serie === anoSerie);

  if (turmasFiltradas.length === 0) {
    select.innerHTML = `<option value="">Nenhuma turma cadastrada para essa combinação</option>`;
    return;
  }

  select.innerHTML = turmasFiltradas.map((t) => `<option value="${t.id}">${t.nome}</option>`).join("");
}

async function buscarAlunosFiltrados() {
  const curso = document.getElementById("filtro-curso-aluno").value;
  const turma = document.getElementById("filtro-turma-aluno").value;
  const busca = document.getElementById("busca-aluno").value.trim();

  const params = new URLSearchParams();
  if (curso !== "todos") params.set("curso_id", curso);
  if (turma !== "todos") params.set("turma_id", turma);
  if (busca) params.set("nome", busca);

  const res = await fetch(`${API_BASE_URL}/api/alunos?${params.toString()}`);
  return res.json();
}

async function renderTabelaAlunos() {
  const corpo = document.getElementById("tabela-alunos");

  try {
    const lista = await buscarAlunosFiltrados();
    ALUNOS_CACHE = lista;

    if (lista.length === 0) {
      corpo.innerHTML = `
        <tr><td colspan="5">
          <div class="estado-vazio">
            ${ICONES.aluno.replace("<svg ", '<svg style="width:40px;height:40px;stroke:var(--cinza-borda);" ')}
            <strong>Nenhum aluno encontrado</strong>
            <p>Ajuste os filtros ou cadastre um novo aluno.</p>
          </div>
        </td></tr>`;
      return;
    }

    corpo.innerHTML = lista
      .map(
        (a) => `
      <tr>
        <td>
          <span class="tabela__nome-com-foto">
            <img class="tabela__foto" src="${a.foto_url || 'https://i.pravatar.cc/100?img=1'}" alt="" />
            ${a.nome}
          </span>
        </td>
        <td>${a.turma.nome}</td>
        <td>${a.turma.curso.nome}</td>
        <td>${a.turma.ano_serie}º ano</td>
        <td>
          <button class="acao-btn" title="Editar" data-editar="${a.id}">${ICONES.editar}</button>
          <button class="acao-btn acao-btn--excluir" title="Excluir" data-excluir="${a.id}">${ICONES.excluir}</button>
        </td>
      </tr>`
      )
      .join("");

    corpo.querySelectorAll("[data-editar]").forEach((btn) => {
      btn.addEventListener("click", () => abrirModalAluno(Number(btn.dataset.editar)));
    });

    corpo.querySelectorAll("[data-excluir]").forEach((btn) => {
      btn.addEventListener("click", () => abrirExclusaoAluno(Number(btn.dataset.excluir)));
    });
  } catch (erro) {
    console.error("Erro ao buscar alunos:", erro);
    corpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--vermelho); padding: 28px;">Não foi possível carregar os alunos.</td></tr>`;
  }
}

function abrirModalAluno(id = null) {
  alunoEmEdicao = id;
  arquivoFotoSelecionado = null;
  const titulo = document.getElementById("titulo-modal-aluno");
  const form = document.getElementById("form-aluno");
  const preview = document.getElementById("preview-foto-aluno");

  form.reset();
  document.getElementById("campo-cor-hex-aluno").value = "#1B7A3E";
  document.getElementById("campo-cor-aluno").value = "#1B7A3E";

  if (id) {
    const aluno = ALUNOS_CACHE.find((a) => a.id === id);
    titulo.textContent = "Editar aluno";
    document.getElementById("campo-nome-aluno").value = aluno.nome;
    document.getElementById("campo-curso-aluno").value = aluno.turma.curso_id;
    document.getElementById("campo-ano-aluno").value = aluno.turma.ano_serie;
    atualizarTurmasDoModal();
    document.getElementById("campo-turma-aluno").value = aluno.turma_id;
    document.getElementById("campo-ingresso-aluno").value = aluno.ano_ingresso || "";
    document.getElementById("campo-frase-aluno").value = aluno.frase || "";
    document.getElementById("campo-bio-aluno").value = aluno.biografia || "";
    document.getElementById("campo-destaque-aluno").checked = aluno.destaque_especial === 1;
    const layout = aluno.layout_perfil || "classico";
    document.getElementById("layout-" + layout).checked = true;
    atualizarEstiloLayout(layout);
    const cor = aluno.cor_tema || "#1B7A3E";
    document.getElementById("campo-cor-aluno").value = cor;
    document.getElementById("campo-cor-hex-aluno").value = cor;
    preview.src = aluno.foto_url || "https://i.pravatar.cc/100?img=68";
  } else {
    titulo.textContent = "Novo aluno";
    if (CURSOS_ALUNO.length > 0) {
      document.getElementById("campo-curso-aluno").value = CURSOS_ALUNO[0].id;
    }
    document.getElementById("campo-ano-aluno").value = "1";
    atualizarTurmasDoModal();
    preview.src = "https://i.pravatar.cc/100?img=68";
  }

  abrirModal("modal-aluno");
}

async function salvarAluno(e) {
  e.preventDefault();

  const nome = document.getElementById("campo-nome-aluno").value.trim();
  const turmaId = Number(document.getElementById("campo-turma-aluno").value);
  const ano_ingresso = document.getElementById("campo-ingresso-aluno").value
    ? Number(document.getElementById("campo-ingresso-aluno").value)
    : null;
  const frase = document.getElementById("campo-frase-aluno").value.trim() || null;
  const biografia = document.getElementById("campo-bio-aluno").value.trim() || null;
  const cor_tema = document.getElementById("campo-cor-hex-aluno").value.trim() || null;
  const destaque_especial = document.getElementById("campo-destaque-aluno").checked ? 1 : 0;
  const layout_perfil = document.querySelector("input[name=layout_perfil]:checked")?.value || "classico";

  if (!turmaId) {
    alert("Selecione um curso e ano/série que tenham turma cadastrada, ou cadastre a turma primeiro em uma edição futura.");
    return;
  }

  const botaoSalvar = e.target.querySelector("button[type=submit]");
  botaoSalvar.disabled = true;
  botaoSalvar.textContent = "Salvando...";

  try {
    let alunoId = alunoEmEdicao;

    const corpo = JSON.stringify({ nome, turma_id: turmaId, ano_ingresso, frase, biografia, cor_tema, destaque_especial, layout_perfil });

    if (alunoEmEdicao) {
      const res = await fetchAutenticado(`${API_BASE_URL}/api/alunos/${alunoEmEdicao}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: corpo,
      });
      if (!res.ok) throw new Error("Falha ao atualizar aluno.");
    } else {
      const res = await fetchAutenticado(`${API_BASE_URL}/api/alunos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: corpo,
      });
      if (!res.ok) throw new Error("Falha ao cadastrar aluno.");
      const novoAluno = await res.json();
      alunoId = novoAluno.id;
    }

    // Se uma nova foto foi selecionada, envia em seguida
    if (arquivoFotoSelecionado) {
      const formData = new FormData();
      formData.append("arquivo", arquivoFotoSelecionado);

      const resFoto = await fetchAutenticado(`${API_BASE_URL}/api/alunos/${alunoId}/foto`, {
        method: "POST",
        body: formData,
      });
      if (!resFoto.ok) throw new Error("Aluno salvo, mas houve um problema ao enviar a foto.");
    }

    mostrarToast(alunoEmEdicao ? "Aluno atualizado com sucesso." : "Aluno cadastrado com sucesso.");
    fecharModal("modal-aluno");
    await renderTabelaAlunos();
  } catch (erro) {
    console.error("Erro ao salvar aluno:", erro);
    alert(erro.message || "Não foi possível salvar o aluno.");
  } finally {
    botaoSalvar.disabled = false;
    botaoSalvar.textContent = "Salvar aluno";
  }
}

function abrirExclusaoAluno(id) {
  alunoParaExcluir = id;
  const aluno = ALUNOS_CACHE.find((a) => a.id === id);
  document.getElementById("texto-excluir-aluno").textContent =
    `Tem certeza que deseja excluir "${aluno.nome}"? Essa ação também remove seus resultados e destaques vinculados.`;
  abrirModal("modal-excluir-aluno");
}

async function confirmarExclusaoAluno() {
  try {
    const res = await fetchAutenticado(`${API_BASE_URL}/api/alunos/${alunoParaExcluir}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Falha ao excluir aluno.");

    fecharModal("modal-excluir-aluno");
    await renderTabelaAlunos();
    mostrarToast("Aluno excluído.");
  } catch (erro) {
    console.error("Erro ao excluir aluno:", erro);
    alert("Não foi possível excluir o aluno.");
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await carregarListasBase();
    inicializarFiltrosAlunos();
    inicializarSelectsModal();
    await renderTabelaAlunos();
  } catch (erro) {
    console.error("Erro ao iniciar página de alunos:", erro);
  }

  // Sincroniza color picker com campo hex
  const colorPicker = document.getElementById("campo-cor-aluno");
  const hexInput = document.getElementById("campo-cor-hex-aluno");
  colorPicker.addEventListener("input", () => { hexInput.value = colorPicker.value; });
  hexInput.addEventListener("input", () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hexInput.value)) colorPicker.value = hexInput.value;
  });

  configurarFechamentoModal("modal-aluno");
  configurarFechamentoModal("modal-excluir-aluno");

  // Guarda o arquivo selecionado (será enviado só ao salvar) e mostra preview
  const inputFoto = document.getElementById("input-foto-aluno");
  inputFoto.addEventListener("change", () => {
    arquivoFotoSelecionado = inputFoto.files[0] || null;
  });
  configurarPreviewFoto("input-foto-aluno", "preview-foto-aluno");

  document.getElementById("botao-novo-aluno").addEventListener("click", () => abrirModalAluno());
  document.getElementById("form-aluno").addEventListener("submit", salvarAluno);
  document.getElementById("confirmar-exclusao-aluno").addEventListener("click", confirmarExclusaoAluno);

  document
    .querySelectorAll("#filtros-alunos select, #busca-aluno")
    .forEach((el) => el.addEventListener("input", renderTabelaAlunos));
});

// Destaca visualmente o layout selecionado
function atualizarEstiloLayout(valor) {
  document.getElementById("label-classico").style.borderColor = valor === "classico" ? "var(--verde)" : "var(--cinza-borda)";
  document.getElementById("label-editorial").style.borderColor = valor === "editorial" ? "var(--verde)" : "var(--cinza-borda)";
}

document.addEventListener("change", (e) => {
  if (e.target.name === "layout_perfil") atualizarEstiloLayout(e.target.value);
});
