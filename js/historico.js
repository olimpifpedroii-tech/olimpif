/* =========================================================
   Histórico — linha do tempo e estatísticas gerais
   ========================================================= */

async function carregarHistorico() {
  try {
    const [edicoesRes, resultadosRes, alunosRes, modalidadesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/edicoes`),
      fetch(`${API_BASE_URL}/api/resultados`),
      fetch(`${API_BASE_URL}/api/alunos`),
      fetch(`${API_BASE_URL}/api/modalidades`),
    ]);

    const edicoes = await edicoesRes.json();
    const resultados = await resultadosRes.json();
    const alunos = await alunosRes.json();
    const modalidades = await modalidadesRes.json();

    // Estatísticas gerais
    const alunosComMedalha = new Set(resultados.map((r) => r.aluno.id)).size;
    const ouros = resultados.filter((r) => r.posicao === "1").length;
    const anos = edicoes.map((e) => e.ano);
    const anoMin = anos.length > 0 ? Math.min(...anos) : new Date().getFullYear();
    const anoMax = anos.length > 0 ? Math.max(...anos) : new Date().getFullYear();

    renderStatsGerais({ total: resultados.length, alunosComMedalha, ouros, modalidades: modalidades.length, edicoes: edicoes.length, anoMin, anoMax });

    // Agrupa medalhas por edição
    const porEdicao = {};
    edicoes.forEach((e) => {
      porEdicao[e.id] = { edicao: e, medalhas: 0, alunos: new Set(), ouros: 0 };
    });
    resultados.forEach((r) => {
      if (porEdicao[r.edicao.id]) {
        porEdicao[r.edicao.id].medalhas++;
        porEdicao[r.edicao.id].alunos.add(r.aluno.id);
        if (r.posicao === "1") porEdicao[r.edicao.id].ouros++;
      }
    });

    const listaOrdenada = Object.values(porEdicao).sort((a, b) => b.edicao.ano - a.edicao.ano);
    const maxMedalhas = Math.max(...listaOrdenada.map((x) => x.medalhas), 1);

    renderHistorico(listaOrdenada, maxMedalhas);
  } catch (erro) {
    console.error("Erro ao carregar histórico:", erro);
  }
}

function renderStatsGerais({ total, alunosComMedalha, ouros, modalidades, edicoes, anoMin, anoMax }) {
  const container = document.getElementById("stats-gerais");

  const itens = [
    {
      valor: total,
      label: "Medalhas conquistadas",
      svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="15" r="5"/><path d="M9 11 6 3h2l4 6 4-6h2l-3 8"/></svg>`,
    },
    {
      valor: alunosComMedalha,
      label: "Alunos premiados",
      svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-6 8-6s8 2 8 6"/></svg>`,
    },
    {
      valor: ouros,
      label: "Medalhas de ouro",
      svg: `<svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    },
    {
      valor: modalidades,
      label: "Modalidades",
      svg: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
    },
    {
      valor: edicoes,
      label: `Edições (${anoMin}–${anoMax})`,
      svg: `<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>`,
    },
  ];

  container.innerHTML = itens.map((item) => `
    <div class="stat-publica">
      <div class="stat-publica__icone">${item.svg}</div>
      <div>
        <span class="stat-publica__valor" data-valor="${item.valor}">0</span>
        <span class="stat-publica__label">${item.label}</span>
      </div>
    </div>`).join("");

  // Anima os números
  setTimeout(() => {
    container.querySelectorAll("[data-valor]").forEach((el) => {
      const val = Number(el.dataset.valor);
      const inicio = performance.now();
      const tick = (agora) => {
        const p = Math.min((agora - inicio) / 1000, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(ease * val);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = val;
      };
      requestAnimationFrame(tick);
    });
  }, 200);
}

function renderHistorico(lista, maxMedalhas) {
  const container = document.getElementById("historico-linha");

  if (lista.length === 0) {
    container.innerHTML = `<p style="color: var(--texto-suave);">Nenhuma edição cadastrada ainda.</p>`;
    return;
  }

  container.innerHTML = lista.map((item) => {
    const pct = Math.round((item.medalhas / maxMedalhas) * 100);
    return `
      <div class="historico-item">
        <div class="historico-ano">${item.edicao.ano}</div>
        <div class="historico-conteudo">
          <div class="historico-card">
            <div>
              <span class="historico-card__total">${item.medalhas}</span>
              <span class="historico-card__label"> medalha${item.medalhas !== 1 ? "s" : ""}</span>
            </div>
            <div style="flex:1;">
              <div class="historico-card__barra">
                <div class="historico-card__barra-fill" style="width:0%" data-pct="${pct}"></div>
              </div>
              <div style="display:flex; justify-content:space-between; margin-top:6px;">
                <span style="font-size:0.75rem; color:var(--texto-suave);">${item.alunos.size} aluno${item.alunos.size !== 1 ? "s" : ""} premiado${item.alunos.size !== 1 ? "s" : ""}</span>
                <span style="font-size:0.75rem; color:#D4A017; font-weight:700;">${item.ouros} ouro${item.ouros !== 1 ? "s" : ""}</span>
              </div>
            </div>
            <a href="edicoes.html" style="font-size:0.8rem; font-weight:700; color:var(--verde-escuro); text-decoration:none; flex-shrink:0;">Ver edição →</a>
          </div>
        </div>
      </div>`;
  }).join("");

  // Anima as barras
  setTimeout(() => {
    container.querySelectorAll("[data-pct]").forEach((el) => {
      el.style.width = el.dataset.pct + "%";
    });
  }, 300);
}

document.addEventListener("DOMContentLoaded", carregarHistorico);
