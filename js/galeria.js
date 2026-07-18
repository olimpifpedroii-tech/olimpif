async function carregarGaleria(cat="todos") {
  const grid=document.getElementById("galeria-grid");
  try {
    const url=cat==="todos"?`${API_BASE_URL}/api/galeria`:`${API_BASE_URL}/api/galeria?categoria=${cat}`;
    const fotos=await fetch(url).then(r=>r.json());
    if (!fotos.length){grid.innerHTML=`<p style="color:var(--texto-suave);padding:40px 0;">Nenhuma foto cadastrada ainda.</p>`;return;}
    grid.innerHTML=fotos.map(f=>`<div class="galeria-item" data-src="${API_BASE_URL}${f.foto_url}" data-titulo="${f.titulo}" data-data="${f.data||''}"><img src="${API_BASE_URL}${f.foto_url}" alt="${f.titulo}" loading="lazy"/><div class="galeria-item__overlay"><div class="galeria-item__titulo">${f.titulo}</div>${f.data?`<div class="galeria-item__data">${f.data}</div>`:""}</div></div>`).join("");
    grid.querySelectorAll(".galeria-item").forEach(item=>item.addEventListener("click",()=>{
      document.getElementById("lightbox-img").src=item.dataset.src;
      document.getElementById("lightbox-titulo").textContent=item.dataset.titulo;
      document.getElementById("lightbox-data").textContent=item.dataset.data;
      document.getElementById("lightbox").classList.add("ativo");
    }));
  } catch(e){grid.innerHTML=`<p style="color:var(--vermelho);">Não foi possível carregar a galeria.</p>`;}
}
document.addEventListener("DOMContentLoaded",()=>{
  carregarGaleria();
  document.getElementById("filtro-cat-galeria").addEventListener("change",e=>carregarGaleria(e.target.value));
  document.getElementById("lightbox-fechar").addEventListener("click",()=>document.getElementById("lightbox").classList.remove("ativo"));
  document.getElementById("lightbox").addEventListener("click",e=>{if(e.target===e.currentTarget)e.currentTarget.classList.remove("ativo");});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")document.getElementById("lightbox").classList.remove("ativo");});
});
