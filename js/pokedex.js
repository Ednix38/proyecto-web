const pokedexGrid = qs('#pokedexGrid');
const shownCountEl = qs('#shownCount');

function clearPokedex(){ pokedexGrid.innerHTML = '' }

function renderPokedex(arr){
  clearPokedex();
  shownCountEl.textContent = arr.length;

  arr.forEach(p => {
    const card = el('div','card');

    const top = el('div');
    const name = el('h3'); name.textContent = `#${p.id} ${toTitle(p.name)}`;
    const spr = el('div','sprite');
    const img = el('img'); img.src = p.sprite; img.alt = p.name;
    spr.appendChild(img);

    top.appendChild(name);
    top.appendChild(spr);

    const bottom = el('div');
    const types = el('div','types');
    p.types.forEach(t=>{
      const tp = el('div','type');
      tp.textContent = toTitle(t);
      types.appendChild(tp);
    });

    const actions = el('div');
    actions.style.display='flex'; actions.style.gap='8px';

    const btnDetails = el('button'); btnDetails.textContent='Ver';
    btnDetails.onclick = ()=> openModalForPokemon(p);

    const btnAdd = el('button'); btnAdd.textContent='Añadir';
    btnAdd.onclick = ()=> addToTeam(p);

    actions.append(btnDetails, btnAdd);
    bottom.append(types, actions);
    card.append(top, bottom);

    // drag
    card.draggable = true;
    card.addEventListener('dragstart', ev=>{
      ev.dataTransfer.setData('text/pokemon', JSON.stringify(p));
    });

    pokedexGrid.appendChild(card);
  });
}

async function loadAndRenderNext(){
  try{
    const list = await fetchPokemonList(perPage, offset);
    offset += perPage;

    const details = await Promise.all(list.map(
      p=> fetchPokemonFull(p.name).catch(()=>null)
    ));
    const valid = details.filter(Boolean);

    pokemons.push(...valid);
    state.shown = pokemons.slice();
    renderPokedex(state.shown);
  }catch(e){
    alert("Error cargando Pokédex: " + e.message);
  }
}

// Search + filters
qs('#searchInput').addEventListener('input', ()=>{
  const q = qs('#searchInput').value.trim().toLowerCase();
  let arr = pokemons.slice();

  if(q) arr = arr.filter(p => p.name.includes(q) || String(p.id) === q);

  const type = qs('#typeFilter').value;
  if(type) arr = arr.filter(p => p.types.includes(type));

  const sort = qs('#sortSelect').value;
  if(sort==='name') arr.sort((a,b)=>a.name.localeCompare(b.name));
  else arr.sort((a,b)=>a.id-b.id);

  renderPokedex(arr);
});

qs('#loadMore').onclick = loadAndRenderNext;
qs('#refreshBtn').onclick = ()=>{ offset=0; pokemons=[]; loadAndRenderNext(); };
qs('#typeFilter').addEventListener('change', ()=> qs('#searchInput').dispatchEvent(new Event('input')));
qs('#sortSelect').addEventListener('change', ()=> qs('#searchInput').dispatchEvent(new Event('input')));
