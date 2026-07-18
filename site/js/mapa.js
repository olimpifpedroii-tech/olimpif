/* Mapa de Conquistas */
async function carregarMapa() {
  const lista = document.getElementById("mapa-lista");
  const visual = document.getElementById("mapa-visual");
  try {
    const modalidades = await fetch(`${API_BASE_URL}/api/modalidades`).then(r => r.json());
    const porEstado = {};
    modalidades.forEach(m => {
      if (!m.estado) return;
      if (!porEstado[m.estado]) porEstado[m.estado] = [];
      porEstado[m.estado].push(m.nome);
    });

    if (!Object.keys(porEstado).length) {
      lista.innerHTML = `<p style="color:var(--texto-suave);">Nenhum estado cadastrado ainda. Edite as modalidades no admin para definir o estado de cada uma.</p>`;
      return;
    }

    const nacional = porEstado["Nacional"] || [];
    const estados = Object.entries(porEstado).filter(([k]) => k !== "Nacional");

    lista.innerHTML = [
      nacional.length ? `<div class="mapa-estado-card mapa-nacional"><div class="mapa-estado-card__titulo"><span></span>🌎 Nacional</div><div class="mapa-estado-card__modalidades">${nacional.map(m => `<span class="mapa-tag">${m}</span>`).join("")}</div></div>` : "",
      ...estados.map(([estado, mods]) => `<div class="mapa-estado-card"><div class="mapa-estado-card__titulo"><span></span>${estado}</div><div class="mapa-estado-card__modalidades">${mods.map(m => `<span class="mapa-tag">${m}</span>`).join("")}</div></div>`)
    ].join("");

    visual.innerHTML = `
      <div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;">
        ${Object.keys(porEstado).map(e => `<div style="background:var(--verde);color:#fff;border-radius:8px;padding:10px 18px;font-family:var(--fonte-display);font-weight:800;font-size:1rem;">${e}</div>`).join("")}
      </div>
      <p style="font-size:0.75rem;color:var(--texto-suave);margin-top:16px;text-align:center;">
        ${Object.keys(porEstado).length} estado${Object.keys(porEstado).length !== 1 ? "s" : ""} com olimpíadas registradas
      </p>`;
  } catch (e) {
    lista.innerHTML = `<p style="color:var(--vermelho);">Não foi possível carregar o mapa.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", carregarMapa);
