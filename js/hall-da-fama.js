const CATEGORIAS = { mais_medalhas:{label:"Mais Medalhas",icone:"🏅"}, destaque_ano:{label:"Destaque do Ano",icone:"⭐"}, recordista:{label:"Recordista do Campus",icone:"🏆"}, internacional:{label:"Conquistas Internacionais",icone:"🌍"} };
async function carregarHall() {
  const container = document.getElementById("hall-conteudo");
  try {
    const lista = await fetch(`${API_BASE_URL}/api/hall-fama`).then(r=>r.json());
    if (!lista.length) { container.innerHTML=`<p style="color:var(--texto-suave);text-align:center;padding:40px 0;">Nenhum membro cadastrado ainda.</p>`; return; }
    const porCat = {};
    lista.forEach(i=>{ if(!porCat[i.categoria])porCat[i.categoria]=[]; porCat[i.categoria].push(i); });
    container.innerHTML = Object.entries(CATEGORIAS).map(([key,cat])=>{
      const itens = porCat[key]||[];
      if (!itens.length) return "";
      return `<div class="hall-categoria"><div class="hall-categoria__titulo"><span>${cat.icone}</span>${cat.label}</div><div class="hall-grid">${itens.map(item=>{
        const foto = item.aluno.foto_url || 'https://i.pravatar.cc/100?img=1';
        const fotoSrc = foto.startsWith('http') ? foto : API_BASE_URL + foto;
        return `<a class="hall-card" href="aluno.html?id=${item.aluno.id}"><span class="hall-card__estrela">✦</span><img class="hall-card__foto" src="${fotoSrc}" alt="${item.aluno.nome}"/><div><div class="hall-card__nome">${item.aluno.nome}</div><div class="hall-card__curso">${item.aluno.turma.curso.nome}</div></div>${item.descricao?`<p class="hall-card__desc">${item.descricao}</p>`:""}${item.ano?`<span class="hall-card__ano">${item.ano}</span>`:""}</a>`;
      }).join("")}</div></div>`;
    }).join("");
  } catch(e) { container.innerHTML=`<p style="color:var(--vermelho);text-align:center;padding:40px 0;">Não foi possível carregar o Hall da Fama.</p>`; }
}
document.addEventListener("DOMContentLoaded", carregarHall);
