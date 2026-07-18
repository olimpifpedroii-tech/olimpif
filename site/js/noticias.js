async function carregarNoticias() {
  const grid=document.getElementById("noticias-grid");
  if(!grid)return;
  try {
    const noticias=await fetch(`${API_BASE_URL}/api/noticias`).then(r=>r.json());
    if(!noticias.length){grid.innerHTML=`<p style="color:var(--texto-suave);grid-column:1/-1;padding:40px 0;text-align:center;">Nenhuma notícia publicada ainda.</p>`;return;}
    grid.innerHTML=noticias.map(n=>`<a class="noticia-card" href="noticia.html?slug=${n.slug}">${n.foto_url?`<img class="noticia-card__img" src="${API_BASE_URL}${n.foto_url}" alt="${n.titulo}" loading="lazy"/>`:`<div class="noticia-card__placeholder"><svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg></div>`}<div class="noticia-card__corpo">${n.data_publicacao?`<span class="noticia-card__data">${n.data_publicacao}</span>`:""}<div class="noticia-card__titulo">${n.titulo}</div>${n.resumo?`<p class="noticia-card__resumo">${n.resumo}</p>`:""}<span class="noticia-card__ler">Ler notícia →</span></div></a>`).join("");
  } catch(e){grid.innerHTML=`<p style="color:var(--vermelho);">Não foi possível carregar as notícias.</p>`;}
}
document.addEventListener("DOMContentLoaded",carregarNoticias);
