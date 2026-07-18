/* =========================================================
   Home — contadores, edição recente, pódio e destaques
   ========================================================= */

const LABEL_CATEGORIA = {
  geral: "Destaque geral",
  turma: "Destaque de turma",
  curso: "Destaque de curso",
  ano: "Destaque de ano/série",
};

// Anima o número do contador subindo de 0 até o valor final
function animarContador(elemento, valorFinal, duracao = 1200) {
  const inicio = performance.now();
  const atualizar = (agora) => {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const easing = 1 - Math.pow(1 - progresso, 3); // ease-out cúbico
    elemento.textContent = Math.floor(easing * valorFinal);
    if (progresso < 1) requestAnimationFrame(atualizar);
    else elemento.textContent = valorFinal;
  };
  requestAnimationFrame(atualizar);
}

async function renderContadores() {
  try {
    // Busca dados em paralelo: resultados, alunos, modalidades, edições
    const [resultadosRes, alunosRes, modalidadesRes, edicoesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/resultados`),
      fetch(`${API_BASE_URL}/api/alunos`),
      fetch(`${API_BASE_URL}/api/modalidades`),
      fetch(`${API_BASE_URL}/api/edicoes`),
    ]);

    const resultados = await resultadosRes.json();
    const alunos = await alunosRes.json();
    const modalidades = await modalidadesRes.json();
    const edicoes = await edicoesRes.json();

    // Alunos premiados = alunos que têm ao menos um resultado
    const alunosComMedalha = new Set(resultados.map((r) => r.aluno.id)).size;

    // Anos de histórico = do menor ao maior ano de edição
    const anos = edicoes.map((e) => e.ano);
    const anoMin = Math.min(...anos);
    const anoMax = Math.max(...anos);
    const anosHistorico = anos.length > 0 ? anoMax - anoMin + 1 : 0;

    animarContador(document.getElementById("cnt-medalhas"), resultados.length);
    animarContador(document.getElementById("cnt-alunos"), alunosComMedalha);
    animarContador(document.getElementById("cnt-olimpiadas"), modalidades.length);
    animarContador(document.getElementById("cnt-anos"), anosHistorico);
  } catch (erro) {
    console.error("Erro ao carregar contadores:", erro);
    ["cnt-medalhas", "cnt-alunos", "cnt-olimpiadas", "cnt-anos"].forEach((id) => {
      document.getElementById(id).textContent = "—";
    });
  }
}

async function renderEdicaoRecente() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/edicoes`);
    const edicoes = await res.json();

    if (edicoes.length === 0) {
      document.getElementById("hero-eyebrow").textContent = "Nenhuma edição cadastrada";
      return null;
    }

    const edicao = [...edicoes].sort((a, b) => b.ano - a.ano)[0];
    document.getElementById("hero-eyebrow").textContent = `Edição ${edicao.ano}`;
    document.getElementById("hero-titulo").textContent = edicao.nome;
    document.getElementById("hero-descricao").textContent = `${edicao.data} — confira o pódio geral e os destaques desta edição.`;
    return edicao;
  } catch (erro) {
    console.error("Erro ao carregar edição recente:", erro);
    return null;
  }
}

async function renderPodioHome(edicaoId) {
  const container = document.getElementById("podio-geral");

  if (!edicaoId) {
    container.innerHTML = `<p style="color: var(--texto-suave);">Ainda não há resultados cadastrados.</p>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/ranking?edicao_id=${edicaoId}`);
    const ranking = await res.json();
    const top3 = ranking.slice(0, 3);

    if (top3.length === 0) {
      container.innerHTML = `<p style="color: var(--texto-suave);">Ainda não há resultados cadastrados para esta edição.</p>`;
      return;
    }

    const comPosicao = top3.map((item, i) => ({ ...item, posicao: i + 1 }));
    const ordem = { 2: 0, 1: 1, 3: 2 };
    const ordenado = [...comPosicao].sort((a, b) => ordem[a.posicao] - ordem[b.posicao]);

    container.innerHTML = ordenado
      .map(
        (item) => `
        <div class="podio__lugar podio__lugar--${item.posicao}">
          <div class="podio__foto-wrap">
            <img class="podio__foto" src="${item.foto_url || "https://i.pravatar.cc/150?img=1"}" alt="Foto de ${item.nome}" />
            <span class="podio__medalha">${item.posicao}º</span>
          </div>
          <div class="podio__bloco">
            <span class="podio__posicao">${item.posicao}º</span>
            <span class="podio__nome">${item.nome}</span>
            <span class="podio__detalhe">${item.total} medalha${item.total === 1 ? "" : "s"}</span>
          </div>
        </div>`
      )
      .join("");
  } catch (erro) {
    console.error("Erro ao carregar pódio:", erro);
    container.innerHTML = `<p style="color: var(--vermelho);">Não foi possível carregar o pódio.</p>`;
  }
}

async function renderDestaquesHome(edicaoId) {
  const container = document.getElementById("destaques-home");

  if (!edicaoId) {
    container.innerHTML = `<p style="color: var(--texto-suave);">Ainda não há destaques cadastrados.</p>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/destaques?edicao_id=${edicaoId}`);
    const destaques = await res.json();

    if (destaques.length === 0) {
      container.innerHTML = `<p style="color: var(--texto-suave);">Ainda não há destaques cadastrados para esta edição.</p>`;
      return;
    }

    container.innerHTML = destaques
      .slice(0, 3)
      .map(
        (d) => `
        <div class="destaque-card">
          <img class="destaque-card__foto" src="${d.aluno.foto_url || "https://i.pravatar.cc/100?img=1"}" alt="Foto de ${d.aluno.nome}" />
          <div class="destaque-card__corpo">
            <span class="destaque-card__categoria">${LABEL_CATEGORIA[d.categoria] || d.categoria}</span>
            <h3>${d.aluno.nome}</h3>
            <p>${d.descricao}</p>
          </div>
        </div>`
      )
      .join("");
  } catch (erro) {
    console.error("Erro ao carregar destaques:", erro);
    container.innerHTML = `<p style="color: var(--vermelho);">Não foi possível carregar os destaques.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  // Contadores e edição recente em paralelo (não dependem um do outro)
  const [edicao] = await Promise.all([renderEdicaoRecente(), renderContadores()]);

  // Pódio e destaques dependem da edição
  if (edicao) {
    await Promise.all([renderPodioHome(edicao.id), renderDestaquesHome(edicao.id)]);
  }
});

/* ---- Busca de aluno no hero ---- */
async function iniciarBuscaHome() {
  const input = document.getElementById("busca-aluno-home");
  const resultado = document.getElementById("busca-resultado");
  if (!input) return;

  let timeout;

  // Enter redireciona para página de busca
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim().length >= 2) {
      window.location.href = `busca.html?q=${encodeURIComponent(input.value.trim())}`;
    }
  });

  input.addEventListener("input", () => {
    clearTimeout(timeout);
    const termo = input.value.trim();

    if (termo.length < 2) {
      resultado.style.display = "none";
      return;
    }

    timeout = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/alunos?nome=${encodeURIComponent(termo)}`);
        const alunos = await res.json();

        if (alunos.length === 0) {
          resultado.style.display = "block";
          resultado.innerHTML = `<p class="busca-vazio">Nenhum aluno encontrado.</p>`;
          return;
        }

        resultado.style.display = "block";
        resultado.innerHTML = alunos.slice(0, 5).map((a) => `
          <a class="busca-item" href="aluno.html?id=${a.id}">
            <img src="${a.foto_url || 'https://i.pravatar.cc/100?img=1'}" alt="${a.nome}" />
            <div class="busca-item__info">
              <strong>${a.nome}</strong>
              <span>${a.turma.curso.nome} · ${a.turma.nome}</span>
            </div>
          </a>`).join("")
          + `<a class="busca-item" href="busca.html?q=${encodeURIComponent(termo)}" style="justify-content:center; color:var(--verde-escuro); font-weight:700; font-size:0.82rem;">
              Ver todos os resultados →
             </a>`;
      } catch (e) {
        resultado.style.display = "none";
      }
    }, 300);
  });

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !resultado.contains(e.target)) {
      resultado.style.display = "none";
    }
  });
}

document.addEventListener("DOMContentLoaded", iniciarBuscaHome);
