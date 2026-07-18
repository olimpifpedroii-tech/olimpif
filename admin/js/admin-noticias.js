/* Admin — Notícias */
let NOTICIAS_CACHE = [], noticiaEmEdicao = null, noticiaParaExcluir = null, arquivoFotoNoticia = null;

function gerarSlug(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-");
}

async function renderTabela() {
  const corpo = document.getElementById("tabela-noticias");
  const res = await fetchAutenticado(`${API_BASE_URL}/api/noticias?apenas_publicadas=false`);
  NOTICIAS_CACHE = await res.json();
  if (!NOTICIAS_CACHE.length) { corpo.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--texto-suave);padding:28px;">Nenhuma notícia cadastrada ainda.</td></tr>`; return; }
  corpo.innerHTML = NOTICIAS_CACHE.map(n => `
    <tr>
      <td style="font-weight:600;">${n.titulo}</td>
      <td>${n.data_publicacao || "—"}</td>
      <td><span style="display:inline-flex;align-items:center;gap:6px;font-size:0.78rem;font-weight:700;padding:3px 10px;border-radius:100px;background:${n.publicada ? 'var(--verde-claro)' : 'var(--cinza-fundo)'};color:${n.publicada ? 'var(--verde-escuro)' : 'var(--texto-suave)'};">${n.publicada ? "Publicada" : "Rascunho"}</span></td>
      <td><button class="acao-btn" data-editar="${n.id}">${ICONES.editar}</button><button class="acao-btn acao-btn--excluir" data-excluir="${n.id}">${ICONES.excluir}</button></td>
    </tr>`).join("");
  corpo.querySelectorAll("[data-editar]").forEach(b => b.addEventListener("click", () => abrirModal(Number(b.dataset.editar))));
  corpo.querySelectorAll("[data-excluir]").forEach(b => b.addEventListener("click", () => abrirExclusao(Number(b.dataset.excluir))));
}

function abrirModal(id = null) {
  noticiaEmEdicao = id; arquivoFotoNoticia = null;
  document.getElementById("form-noticia").reset();
  document.getElementById("preview-noticia").style.display = "none";
  if (id) {
    const n = NOTICIAS_CACHE.find(x => x.id === id);
    document.getElementById("titulo-modal-noticia").textContent = "Editar notícia";
    document.getElementById("campo-titulo-noticia").value = n.titulo;
    document.getElementById("campo-slug-noticia").value = n.slug;
    document.getElementById("campo-data-noticia").value = n.data_publicacao || "";
    document.getElementById("campo-publicada-noticia").checked = n.publicada === 1;
    document.getElementById("campo-resumo-noticia").value = n.resumo || "";
    document.getElementById("campo-conteudo-noticia").value = n.conteudo;
    if (n.foto_url) { const p = document.getElementById("preview-noticia"); p.src = n.foto_url; p.style.display = "block"; }
  } else { document.getElementById("titulo-modal-noticia").textContent = "Nova notícia"; }
  document.getElementById("modal-noticia").removeAttribute("hidden");
}

async function salvarNoticia(e) {
  e.preventDefault();
  const btn = document.getElementById("btn-salvar-noticia");
  btn.disabled = true; btn.textContent = "Salvando...";
  try {
    const dados = { titulo: document.getElementById("campo-titulo-noticia").value.trim(), slug: document.getElementById("campo-slug-noticia").value.trim(), resumo: document.getElementById("campo-resumo-noticia").value.trim() || null, conteudo: document.getElementById("campo-conteudo-noticia").value.trim(), publicada: document.getElementById("campo-publicada-noticia").checked ? 1 : 0, data_publicacao: document.getElementById("campo-data-noticia").value.trim() || null };
    const url = noticiaEmEdicao ? `${API_BASE_URL}/api/noticias/${noticiaEmEdicao}` : `${API_BASE_URL}/api/noticias`;
    const res = await fetchAutenticado(url, { method: noticiaEmEdicao ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(dados) });
    if (!res.ok) { const err = await res.json(); throw new Error(err.detail || "Erro ao salvar."); }
    const noticia = await res.json();
    if (arquivoFotoNoticia) { const form = new FormData(); form.append("arquivo", arquivoFotoNoticia); await fetchAutenticado(`${API_BASE_URL}/api/noticias/${noticia.id}/foto`, { method: "POST", body: form }); }
    fecharModal("modal-noticia"); await renderTabela(); mostrarToast(noticiaEmEdicao ? "Notícia atualizada." : "Notícia criada.");
  } catch (err) { alert(err.message); } finally { btn.disabled = false; btn.textContent = "Salvar"; }
}

function abrirExclusao(id) { noticiaParaExcluir = id; const n = NOTICIAS_CACHE.find(x => x.id === id); document.getElementById("texto-excluir-noticia").textContent = `Excluir "${n.titulo}"?`; document.getElementById("modal-excluir-noticia").removeAttribute("hidden"); }
async function confirmarExclusao() { await fetchAutenticado(`${API_BASE_URL}/api/noticias/${noticiaParaExcluir}`, { method: "DELETE" }); fecharModal("modal-excluir-noticia"); await renderTabela(); mostrarToast("Notícia excluída."); }

document.addEventListener("DOMContentLoaded", () => {
  renderTabela(); configurarFechamentoModal("modal-noticia"); configurarFechamentoModal("modal-excluir-noticia");
  document.getElementById("botao-nova-noticia").addEventListener("click", () => abrirModal());
  document.getElementById("form-noticia").addEventListener("submit", salvarNoticia);
  document.getElementById("confirmar-excluir-noticia").addEventListener("click", confirmarExclusao);
  document.getElementById("campo-titulo-noticia").addEventListener("input", e => { if (!noticiaEmEdicao) document.getElementById("campo-slug-noticia").value = gerarSlug(e.target.value); });
  document.getElementById("input-foto-noticia").addEventListener("change", e => { arquivoFotoNoticia = e.target.files[0]; if (!arquivoFotoNoticia) return; const p = document.getElementById("preview-noticia"); const r = new FileReader(); r.onload = ev => { p.src = ev.target.result; p.style.display = "block"; }; r.readAsDataURL(arquivoFotoNoticia); });
});
