/* =========================================================
   Ranking de medalhistas — dados reais da API
   ========================================================= */

const LABEL_MEDALHA_RANKING = { ouro: "Ouro", prata: "Prata", bronze: "Bronze", mh: "Menção Honrosa" };
const SIGLA_MEDALHA_RANKING = { ouro: "🥇 Ouro", prata: "🥈 Prata", bronze: "🥉 Bronze", mh: "MH" };

async function inicializarFiltroRanking() {
  const res = await fetch(`${API_BASE_URL}/api/edicoes`);
  const edicoes = await res.json();

  preencherFiltro(
    document.getElementById("filtro-edicao-ranking"),
    edicoes.map((e) => ({ value: e.id, label: e.nome })),
    "Todas as edições"
  );
}

async function montarRanking() {
  const edicao = document.getElementById("filtro-edicao-ranking").value;

  try {
    const params = new URLSearchParams();
    if (edicao !== "todos") params.set("edicao_id", edicao);

    const res = await fetch(`${API_BASE_URL}/api/ranking?${params.toString()}`);
    const lista = await res.json();
    renderRanking(lista);
  } catch (erro) {
    console.error("Erro ao buscar ranking:", erro);
    document.getElementById("tabela-ranking").innerHTML =
      `<tr><td colspan="5" style="text-align:center; color: var(--vermelho); padding: 28px;">Não foi possível carregar o ranking. Verifique se a API está rodando.</td></tr>`;
  }
}

function renderRanking(lista) {
  const corpo = document.getElementById("tabela-ranking");

  if (lista.length === 0) {
    corpo.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--texto-suave); padding: 28px;">Nenhum medalhista encontrado para os filtros selecionados.</td></tr>`;
    return;
  }

  corpo.innerHTML = lista
    .map((item, indice) => {
      const id = `ranking-${indice}`;
      const badges = ["ouro", "prata", "bronze", "mh"]
        .filter((tipo) => item.totais[tipo] > 0)
        .map((tipo) => `<span class="ranking-badge ranking-badge--${tipo}">${item.totais[tipo]}× ${LABEL_MEDALHA_RANKING[tipo]}</span>`)
        .join("");

      const linhasDetalhe = item.medalhas
        .map(
          (m) => `
          <tr>
            <td>${SIGLA_MEDALHA_RANKING[m.tipo]}</td>
            <td>${m.modalidade}</td>
            <td>${m.edicao}</td>
          </tr>`
        )
        .join("");

      return `
        <tr class="ranking-linha" data-toggle="${id}">
          <td class="ranking-posicao">${indice + 1}º</td>
          <td>
            <div class="ranking-aluno">
              <img src="${item.foto_url || 'https://i.pravatar.cc/100?img=1'}" alt="Foto de ${item.nome}" />
              <span>${item.nome}</span>
            </div>
          </td>
          <td><div class="ranking-badges">${badges}</div></td>
          <td class="ranking-total">${item.total}</td>
          <td style="display:flex; gap:8px; align-items:center;">
            <a href="aluno.html?id=${item.aluno_id}" title="Ver perfil" style="display:inline-flex; align-items:center; justify-content:center; width:28px; height:28px; border-radius:50%; background:var(--verde-claro); text-decoration:none;" onclick="event.stopPropagation()">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--verde-escuro)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>
            </a>
            <span class="ranking-toggle">
              <svg viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6"/></svg>
            </span>
          </td>
        </tr>
        <tr class="ranking-detalhe-linha" id="${id}">
          <td colspan="5">
            <div class="ranking-detalhe">
              <table>
                <thead>
                  <tr>
                    <th>Medalha</th>
                    <th>Modalidade</th>
                    <th>Edição</th>
                  </tr>
                </thead>
                <tbody>
                  ${linhasDetalhe}
                </tbody>
              </table>
            </div>
          </td>
        </tr>`;
    })
    .join("");

  corpo.querySelectorAll(".ranking-linha").forEach((linha) => {
    linha.addEventListener("click", () => {
      const detalhe = document.getElementById(linha.dataset.toggle);
      detalhe.classList.toggle("is-visivel");
      linha.classList.toggle("is-aberta");
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await inicializarFiltroRanking();
    await montarRanking();

    document.getElementById("filtro-edicao-ranking").addEventListener("change", montarRanking);
  } catch (erro) {
    console.error("Erro ao iniciar página de ranking:", erro);
  }
});
