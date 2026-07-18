/* =========================================================
   Medalhistas — filtros + pódio + tabela (dados reais da API)
   ========================================================= */

let TODOS_RESULTADOS = [];

const TIPOS_MEDALHA = [
  { value: "1", label: "Ouro" },
  { value: "2", label: "Prata" },
  { value: "3", label: "Bronze" },
  { value: "mh", label: "Menção Honrosa" },
];

async function buscarListas() {
  const [edicoesRes, turmasRes, cursosRes, modalidadesRes] = await Promise.all([
    fetch(`${API_BASE_URL}/api/edicoes`),
    fetch(`${API_BASE_URL}/api/turmas`),
    fetch(`${API_BASE_URL}/api/cursos`),
    fetch(`${API_BASE_URL}/api/modalidades`),
  ]);

  return {
    edicoes: await edicoesRes.json(),
    turmas: await turmasRes.json(),
    cursos: await cursosRes.json(),
    modalidades: await modalidadesRes.json(),
  };
}

function inicializarFiltros(listas) {
  preencherFiltro(
    document.getElementById("filtro-edicao"),
    listas.edicoes.map((e) => ({ value: e.id, label: e.nome })),
    "Todas as edições"
  );
  preencherFiltro(
    document.getElementById("filtro-turma"),
    listas.turmas.map((t) => ({ value: t.id, label: t.nome })),
    "Todas as turmas"
  );
  preencherFiltro(
    document.getElementById("filtro-curso"),
    listas.cursos.map((c) => ({ value: c.id, label: c.nome })),
    "Todos os cursos"
  );
  preencherFiltro(document.getElementById("filtro-tipo"), TIPOS_MEDALHA, "Todos os tipos");
  preencherFiltro(
    document.getElementById("filtro-modalidade"),
    listas.modalidades.map((m) => ({ value: m.id, label: m.nome })),
    "Todas as modalidades"
  );
}

async function buscarResultados() {
  const edicao = document.getElementById("filtro-edicao").value;
  const turma = document.getElementById("filtro-turma").value;
  const curso = document.getElementById("filtro-curso").value;
  const tipo = document.getElementById("filtro-tipo").value;
  const modalidade = document.getElementById("filtro-modalidade").value;

  const params = new URLSearchParams();
  if (edicao !== "todos") params.set("edicao_id", edicao);
  if (turma !== "todos") params.set("turma_id", turma);
  if (curso !== "todos") params.set("curso_id", curso);
  if (tipo !== "todos") params.set("posicao", tipo);
  if (modalidade !== "todos") params.set("modalidade_id", modalidade);

  const res = await fetch(`${API_BASE_URL}/api/resultados?${params.toString()}`);
  return res.json();
}

function renderTabela(lista) {
  const corpo = document.getElementById("tabela-medalhistas");
  const contagem = document.getElementById("contagem-resultados");
  contagem.textContent = `${lista.length} resultado${lista.length === 1 ? "" : "s"}`;

  if (lista.length === 0) {
    corpo.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--texto-suave); padding: 28px;">Nenhum medalhista encontrado para os filtros selecionados.</td></tr>`;
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
        <td>
          <span style="display:flex; align-items:center; gap:8px;">
            ${r.aluno.nome}
            <a href="aluno.html?id=${r.aluno.id}" title="Ver perfil" style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px; border-radius:50%; background:var(--verde-claro); text-decoration:none; flex-shrink:0;">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--verde-escuro)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>
            </a>
          </span>
        </td>
        <td>${r.aluno.turma.nome}</td>
        <td>${r.aluno.turma.curso.nome}</td>
        <td>${r.modalidade.nome}</td>
        <td>${r.edicao.ano}</td>
      </tr>`;
    })
    .join("");
}

function renderPodioFiltrado(lista) {
  const container = document.getElementById("podio-filtrado");

  const mapaPosicao = { "1": 1, "2": 2, "3": 3 };
  const top = lista
    .filter((r) => mapaPosicao[r.posicao])
    .map((r) => ({ ...r, posicaoNum: mapaPosicao[r.posicao] }))
    // Mantém apenas um resultado por posição (1, 2 e 3), o primeiro encontrado
    .filter((r, indice, arr) => arr.findIndex((x) => x.posicaoNum === r.posicaoNum) === indice);

  if (top.length === 0) {
    container.innerHTML = `<p style="color: var(--texto-suave);">Sem dados para o pódio com os filtros atuais.</p>`;
    return;
  }

  const ordem = { 2: 0, 1: 1, 3: 2 };
  const ordenado = [...top].sort((a, b) => ordem[a.posicaoNum] - ordem[b.posicaoNum]);

  container.innerHTML = ordenado
    .map(
      (r) => `
      <div class="podio__lugar podio__lugar--${r.posicaoNum}">
        <div class="podio__foto-wrap">
          <img class="podio__foto" src="${r.aluno.foto_url || 'https://i.pravatar.cc/150?img=1'}" alt="Foto de ${r.aluno.nome}" />
          <span class="podio__medalha">${r.posicaoNum}º</span>
        </div>
        <div class="podio__bloco">
          <span class="podio__posicao">${r.posicaoNum}º</span>
          <span class="podio__nome">${r.aluno.nome}</span>
          <span class="podio__detalhe">${r.modalidade.nome} · ${r.edicao.ano}</span>
        </div>
      </div>`
    )
    .join("");
}

async function atualizar() {
  try {
    const resultado = await buscarResultados();
    renderPodioFiltrado(resultado);
    renderTabela(resultado);
  } catch (erro) {
    console.error("Erro ao buscar resultados:", erro);
    document.getElementById("tabela-medalhistas").innerHTML =
      `<tr><td colspan="6" style="text-align:center; color: var(--vermelho); padding: 28px;">Não foi possível carregar os medalhistas. Verifique se a API está rodando.</td></tr>`;
  }
}

async function iniciar() {
  try {
    const listas = await buscarListas();
    inicializarFiltros(listas);
    await atualizar();

    document
      .querySelectorAll("#filtros-medalhistas select")
      .forEach((select) => select.addEventListener("change", atualizar));
  } catch (erro) {
    console.error("Erro ao iniciar página de medalhistas:", erro);
  }
}

document.addEventListener("DOMContentLoaded", iniciar);
