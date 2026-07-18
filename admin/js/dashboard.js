/* =========================================================
   Dashboard — cards de contagem (dados reais da API)
   ========================================================= */

const CARDS_DASHBOARD = [
  { chave: "alunos", label: "Alunos cadastrados", icone: "aluno" },
  { chave: "modalidades", label: "Modalidades", icone: "modalidade" },
  { chave: "edicoes", label: "Edições registradas", icone: "edicao" },
  { chave: "medalhas", label: "Medalhas lançadas", icone: "medalha" },
  { chave: "destaques", label: "Destaques cadastrados", icone: "destaque" },
];

async function renderDashboard() {
  const container = document.getElementById("dashboard-cards");

  try {
    const res = await fetchAutenticado(`${API_BASE_URL}/api/dashboard/resumo`);
    const resumo = await res.json();

    container.innerHTML = CARDS_DASHBOARD.map(
      (c) => `
      <div class="dashboard-card">
        <div class="dashboard-card__icon">${ICONES[c.icone]}</div>
        <span class="dashboard-card__valor">${resumo[c.chave]}</span>
        <span class="dashboard-card__label">${c.label}</span>
      </div>`
    ).join("");
  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);
    container.innerHTML = `<p style="color: var(--vermelho);">Não foi possível carregar os dados. Verifique se a API está rodando.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", renderDashboard);
