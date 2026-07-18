let HALL_CACHE=[],ALUNOS_HALL=[],hallEmEdicao=null,hallParaExcluir=null;
const LABEL_CAT={mais_medalhas:"Mais Medalhas",destaque_ano:"Destaque do Ano",recordista:"Recordista",internacional:"Internacional"};
async function iniciar(){
  ALUNOS_HALL=await fetch(`${API_BASE_URL}/api/alunos`).then(r=>r.json());
  document.getElementById("campo-aluno-hall").innerHTML=ALUNOS_HALL.map(a=>`<option value="${a.id}">${a.nome}</option>`).join("");
  await renderTabela();
  configurarFechamentoModal("modal-hall");configurarFechamentoModal("modal-excluir-hall");
  document.getElementById("botao-novo-hall").addEventListener("click",()=>abrirModal(null));
  document.getElementById("form-hall").addEventListener("submit",salvar);
  document.getElementById("confirmar-excluir-hall").addEventListener("click",confirmarExclusao);
}
async function renderTabela(){
  const corpo=document.getElementById("tabela-hall");
  const res=await fetchAutenticado(`${API_BASE_URL}/api/hall-fama`);
  HALL_CACHE=await res.json();
  if(!HALL_CACHE.length){corpo.innerHTML=`<tr><td colspan="5" style="text-align:center;color:var(--texto-suave);padding:28px;">Nenhum membro cadastrado ainda.</td></tr>`;return;}
  corpo.innerHTML=HALL_CACHE.map(item=>`<tr><td><span class="tabela__nome-com-foto"><img class="tabela__foto" src="${item.aluno.foto_url||'https://i.pravatar.cc/60?img=1'}"/>${item.aluno.nome}</span></td><td>${LABEL_CAT[item.categoria]||item.categoria}</td><td>${item.ano||"—"}</td><td style="max-width:280px;white-space:normal;">${item.descricao||"—"}</td><td><button class="acao-btn" data-editar="${item.id}">${ICONES.editar}</button><button class="acao-btn acao-btn--excluir" data-excluir="${item.id}">${ICONES.excluir}</button></td></tr>`).join("");
  corpo.querySelectorAll("[data-editar]").forEach(b=>b.addEventListener("click",()=>abrirModal(Number(b.dataset.editar))));
  corpo.querySelectorAll("[data-excluir]").forEach(b=>b.addEventListener("click",()=>abrirExclusao(Number(b.dataset.excluir))));
}
function abrirModal(id){
  hallEmEdicao=id;document.getElementById("form-hall").reset();
  if(id){const item=HALL_CACHE.find(x=>x.id===id);document.getElementById("campo-aluno-hall").value=item.aluno.id;document.getElementById("campo-cat-hall").value=item.categoria;document.getElementById("campo-ano-hall").value=item.ano||"";document.getElementById("campo-desc-hall").value=item.descricao||"";}
  document.getElementById("titulo-modal-hall").textContent=id?"Editar membro":"Adicionar ao Hall da Fama";
  document.getElementById("modal-hall").removeAttribute("hidden");
}
async function salvar(e){
  e.preventDefault();
  const dados={aluno_id:Number(document.getElementById("campo-aluno-hall").value),categoria:document.getElementById("campo-cat-hall").value,ano:document.getElementById("campo-ano-hall").value?Number(document.getElementById("campo-ano-hall").value):null,descricao:document.getElementById("campo-desc-hall").value.trim()||null};
  const url=hallEmEdicao?`${API_BASE_URL}/api/hall-fama/${hallEmEdicao}`:`${API_BASE_URL}/api/hall-fama`;
  const res=await fetchAutenticado(url,{method:hallEmEdicao?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(dados)});
  if(!res.ok){alert("Erro ao salvar.");return;}
  fecharModal("modal-hall");await renderTabela();mostrarToast(hallEmEdicao?"Membro atualizado.":"Adicionado ao Hall da Fama.");
}
function abrirExclusao(id){hallParaExcluir=id;const item=HALL_CACHE.find(x=>x.id===id);document.getElementById("texto-excluir-hall").textContent=`Remover "${item.aluno.nome}" do Hall da Fama?`;document.getElementById("modal-excluir-hall").removeAttribute("hidden");}
async function confirmarExclusao(){await fetchAutenticado(`${API_BASE_URL}/api/hall-fama/${hallParaExcluir}`,{method:"DELETE"});fecharModal("modal-excluir-hall");await renderTabela();mostrarToast("Removido do Hall da Fama.");}
document.addEventListener("DOMContentLoaded",iniciar);
