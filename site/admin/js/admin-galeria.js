let FOTOS_CACHE=[],fotoParaExcluir=null;
const LABEL_CAT_G={cerimonia:"Cerimônia",premiacao:"Premiação",viagem:"Viagem",competicao:"Competição"};
async function renderGaleria(cat="todos"){
  const grid=document.getElementById("galeria-admin-grid");
  const url=cat==="todos"?`${API_BASE_URL}/api/galeria`:`${API_BASE_URL}/api/galeria?categoria=${cat}`;
  const fotos=await fetch(url).then(r=>r.json());FOTOS_CACHE=fotos;
  if(!fotos.length){grid.innerHTML=`<p style="color:var(--texto-suave);grid-column:1/-1;padding:28px;">Nenhuma foto cadastrada ainda.</p>`;return;}
  grid.innerHTML=fotos.map(f=>`<div class="galeria-admin-item"><img src="${API_BASE_URL}${f.foto_url}" alt="${f.titulo}"/><div class="galeria-admin-item__info"><div class="galeria-admin-item__titulo">${f.titulo}</div><div class="galeria-admin-item__cat">${LABEL_CAT_G[f.categoria]||f.categoria}${f.data?" · "+f.data:""}</div><div class="galeria-admin-item__acoes"><button class="acao-btn acao-btn--excluir" data-excluir="${f.id}">${ICONES.excluir}</button></div></div></div>`).join("");
  grid.querySelectorAll("[data-excluir]").forEach(b=>b.addEventListener("click",()=>{fotoParaExcluir=Number(b.dataset.excluir);document.getElementById("modal-excluir-foto").removeAttribute("hidden");}));
}
async function enviarFoto(e){
  e.preventDefault();const btn=document.getElementById("btn-salvar-foto");btn.disabled=true;btn.textContent="Enviando...";
  try{
    const arquivo=document.getElementById("input-foto-galeria").files[0];if(!arquivo){alert("Selecione uma foto.");return;}
    const form=new FormData();form.append("arquivo",arquivo);form.append("titulo",document.getElementById("campo-titulo-foto").value);form.append("categoria",document.getElementById("campo-cat-foto").value);
    const data=document.getElementById("campo-data-foto").value;if(data)form.append("data",data);
    const desc=document.getElementById("campo-desc-foto").value;if(desc)form.append("descricao",desc);
    const res=await fetchAutenticado(`${API_BASE_URL}/api/galeria`,{method:"POST",body:form});
    if(!res.ok)throw new Error("Falha ao enviar foto.");
    fecharModal("modal-foto");document.getElementById("form-foto").reset();document.getElementById("preview-galeria").style.display="none";
    await renderGaleria(document.getElementById("filtro-cat-admin").value);mostrarToast("Foto adicionada à galeria.");
  }catch(err){alert(err.message);}finally{btn.disabled=false;btn.textContent="Enviar foto";}
}
async function confirmarExclusaoFoto(){await fetchAutenticado(`${API_BASE_URL}/api/galeria/${fotoParaExcluir}`,{method:"DELETE"});fecharModal("modal-excluir-foto");await renderGaleria(document.getElementById("filtro-cat-admin").value);mostrarToast("Foto excluída.");}
document.addEventListener("DOMContentLoaded",()=>{
  renderGaleria();configurarFechamentoModal("modal-foto");configurarFechamentoModal("modal-excluir-foto");
  document.getElementById("botao-nova-foto").addEventListener("click",()=>document.getElementById("modal-foto").removeAttribute("hidden"));
  document.getElementById("form-foto").addEventListener("submit",enviarFoto);
  document.getElementById("confirmar-excluir-foto").addEventListener("click",confirmarExclusaoFoto);
  document.getElementById("filtro-cat-admin").addEventListener("change",e=>renderGaleria(e.target.value));
  document.getElementById("input-foto-galeria").addEventListener("change",e=>{const f=e.target.files[0];if(!f)return;const prev=document.getElementById("preview-galeria");const reader=new FileReader();reader.onload=ev=>{prev.src=ev.target.result;prev.style.display="block";};reader.readAsDataURL(f);});
});
