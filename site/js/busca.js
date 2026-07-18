/* =========================================================
   Busca de alunos — página separada
   ========================================================= */

let TOTAL_MEDALHAS_POR_ALUNO = {};

async function buscarAlunos(termo) {
  const status = document.getElementById("busca-status");
  const grid = document.getElementById("busca-grid");

  if (termo.length < 2) {
    status.style.display = "block";
    status.textContent = "Digite pelo menos 2 caracteres para buscar.";
    grid.style.display = "none";
    return;
  }

  try {
    status.style.display = "block";
    status.textContent = "Buscando...";
    grid.style.display = "none";

    const res = await fetch(`${API_BASE_URL}/api/alunos?nome=${encodeURIComponent(termo)}`);
    const alunos = await res.json();

    if (alunos.length === 0) {
      status.textContent = `Nenhum aluno encontrado para "${termo}".`;
      return;
    }

    // Busca total de medalhas por aluno (do ranking geral)
    if (Object.keys(TOTAL_MEDALHAS_POR_ALUNO).length === 0) {
      const rankRes = await fetch(`${API_BASE_URL}/api/ranking`);
      const ranking = await rankRes.json();
      ranking.forEach((r) => { TOTAL_MEDALHAS_POR_ALUNO[r.aluno_id] = r.total; });
    }

    status.style.display = "none";
    grid.style.display = "grid";

    grid.innerHTML = alunos.map((a) => {
      const total = TOTAL_MEDALHAS_POR_ALUNO[a.id] || 0;
      return `
        <a class="aluno-card" href="aluno.html?id=${a.id}">
          <img src="${a.foto_url || 'https://i.pravatar.cc/100?img=1'}" alt="${a.nome}" />
          <div class="aluno-card__info">
            <strong>${a.nome}</strong>
            <span>${a.turma.curso.nome} · ${a.turma.nome}</span>
          </div>
          ${total > 0 ? `<span class="aluno-card__medalhas" title="${total} medalha${total !== 1 ? 's' : ''}">${total}</span>` : ""}
        </a>`;
    }).join("");

  } catch (erro) {
    console.error("Erro ao buscar alunos:", erro);
    status.style.display = "block";
    status.textContent = "Não foi possível realizar a busca. Verifique se a API está rodando.";
    grid.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("busca-input");
  let timeout;

  // Se veio com ?q= na URL, já preenche e busca
  const params = new URLSearchParams(window.location.search);
  const termoPre = params.get("q");
  if (termoPre) {
    input.value = termoPre;
    buscarAlunos(termoPre);
  }

  input.addEventListener("input", () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => buscarAlunos(input.value.trim()), 300);
  });
});
