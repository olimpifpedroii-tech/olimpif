async function carregarNoticia() {
  const slug=new URLSearchParams(window.location.search).get("slug");
  const container=document.getElementById("noticia-conteudo");
  if(!slug){container.innerHTML=`<p style="color:var(--vermelho);">Notícia não especificada.</p>`;return;}
  try {
    const res=await fetch(`${API_BASE_URL}/api/noticias/${slug}`);
    if(!res.ok)throw new Error();
    const n=await res.json();
    document.title=`${n.titulo} — Portal OlimpIF`;
    container.innerHTML=`<a class="noticia-page__voltar" href="noticias.html"><svg viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>Voltar para notícias</a>${n.foto_url?`<img class="noticia-page__capa" src="${API_BASE_URL}${n.foto_url}" alt="${n.titulo}"/>`:""}${n.data_publicacao?`<span class="noticia-page__data">${n.data_publicacao}</span>`:""}<h1 class="noticia-page__titulo">${n.titulo}</h1>${n.resumo?`<p class="noticia-page__resumo">${n.resumo}</p>`:""}<div class="noticia-page__conteudo">${n.conteudo}</div>`;
  } catch(e){container.innerHTML=`<p style="color:var(--vermelho);">Não foi possível carregar a notícia.</p>`;}
}
document.addEventListener("DOMContentLoaded",carregarNoticia);
