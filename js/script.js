/* -------------------------
    UTILIDADES Y ESTADO GLOBAL
    ------------------------- */
const API_BASE = 'https://pokeapi.co/api/v2';
const perPage = 24;
let offset = 0;
let pokemons = []; // lista cache
let typesList = [];
const state = {
  shown: [],
  team: loadTeam(),
  currentGame: null
};

// Helpers
function qs(sel, root=document) { return root.querySelector(sel) }
function qsa(sel, root=document) { return Array.from(root.querySelectorAll(sel)) }
function el(tag, cls=''){ const e=document.createElement(tag); if(cls) e.className=cls; return e }
function toTitle(s){ if(!s) return ''; return s.charAt(0).toUpperCase()+s.slice(1) }
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;') }

/* -------------------------
    FETCHS A POKEAPI
    ------------------------- */
async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error('Fetch error '+res.status);
  return await res.json();
}

async function fetchPokemonList(limit=perPage, off=offset){
  // returns array of {name, url}
  const url = `${API_BASE}/pokemon?limit=${limit}&offset=${off}`;
  const data = await fetchJSON(url);
  return data.results;
}

async function fetchPokemonFull(nameOrId){
  const url = `${API_BASE}/pokemon/${nameOrId.toString().toLowerCase()}`;
  const data = await fetchJSON(url);
  // normalize
  return {
    id: data.id,
    name: data.name,
    types: data.types.map(t => t.type.name),
    sprite: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    stats: data.stats.reduce((o,s)=> (o[s.stat.name]=s.base_stat,o), {}),
    moves: data.moves.map(m => m.move.name),
    weight: data.weight,
    height: data.height
  };
}

async function fetchTypes(){
  const data = await fetchJSON(API_BASE+'/type');
  return data.results.map(r=>r.name);
}

/* -------------------------
    RENDER POKEDEX
    ------------------------- */
const pokedexGrid = qs('#pokedexGrid');
const shownCountEl = qs('#shownCount');

async function loadAndRenderNext(){
  try{
    const list = await fetchPokemonList(perPage, offset);
    offset += perPage;
    // fetch details in parallel (limited)
    const details = await Promise.all(list.map(l => fetchPokemonFull(l.name).catch(e => null)));
    const valid = details.filter(Boolean);
    pokemons.push(...valid);
    state.shown = pokemons.slice();
    renderPokedex(state.shown);
  }catch(e){
    alert('Error cargando Pokédex: '+e.message);
  }
}

function clearPokedex(){
  pokedexGrid.innerHTML = '';
}

function renderPokedex(arr){
  clearPokedex();
  shownCountEl.textContent = arr.length;
  arr.forEach(p => {
    const card = el('div','card');
    const top = el('div');
    const name = el('h3'); name.textContent = `#${p.id} ${toTitle(p.name)}`;
    const spr = el('div','sprite');
    const img = el('img'); img.src = p.sprite; img.alt = p.name; img.style.maxWidth='120px';
    spr.appendChild(img);
    top.appendChild(name);
    top.appendChild(spr);

    const bottom = el('div');
    const types = el('div','types');
    p.types.forEach(t=>{
      const tp = el('div','type'); tp.textContent = toTitle(t);
      types.appendChild(tp);
    });

    const actions = el('div');
    actions.style.display='flex'; actions.style.gap='8px'; actions.style.marginTop='8px';
    const btnDetails = el('button'); btnDetails.textContent='Ver';
    btnDetails.onclick = ()=> openModalForPokemon(p);
    const btnAdd = el('button'); btnAdd.textContent='Añadir';
    btnAdd.onclick = ()=> addToTeam(p);
    actions.appendChild(btnDetails); actions.appendChild(btnAdd);

    bottom.appendChild(types);
    bottom.appendChild(actions);

    card.appendChild(top);
    card.appendChild(bottom);

    // drag support - allows dragging pokémon to team
    card.draggable = true;
    card.addEventListener('dragstart', (ev)=> {
      ev.dataTransfer.setData('text/pokemon', JSON.stringify(p));
    });

    pokedexGrid.appendChild(card);
  });
}

/* -------------------------
    MODAL
    ------------------------- */
const modal = qs('#modal');
const modalTitle = qs('#modalTitle');
const modalBody = qs('#modalBody');
qs('#modalClose').onclick = ()=> closeModal();

function openModalForPokemon(p){
  modalTitle.textContent = `#${p.id} ${toTitle(p.name)}`;
  modalBody.innerHTML = '';
  const wrap = el('div','flex');
  const left = el('div','col');
  const img = el('img'); img.src = p.sprite; img.style.maxWidth='220px';
  left.appendChild(img);
  const right = el('div','col');
  const types = el('div','types'); p.types.forEach(t=>{ const tp=el('div','type'); tp.textContent=toTitle(t); types.appendChild(tp) });
  right.appendChild(types);
  right.appendChild(el('div','small'));
  const statsBox = el('div', 'small'); statsBox.style.marginTop='10px';
  for(const [k,v] of Object.entries(p.stats)){
    const row = el('div'); row.style.marginBottom='6px';
    row.innerHTML = `<strong>${toTitle(k)}</strong> <span style="float:right">${v}</span>
                      <div class="statbar" style="margin-top:4px"><div class="statfill" style="width:${Math.min(100,Math.round(v))}%"></div></div>`;
    statsBox.appendChild(row);
  }
  right.appendChild(statsBox);
  wrap.appendChild(left);
  wrap.appendChild(right);
  modalBody.appendChild(wrap);

  // actions
  const btns = el('div', 'flex'); btns.style.marginTop='12px';
  const addBtn = el('button'); addBtn.textContent='Añadir al equipo';
  addBtn.onclick = ()=> { addToTeam(p); closeModal(); };
  const calcBtn = el('button'); calcBtn.textContent='Abrir Damage Calc';
  calcBtn.onclick = ()=> { switchModule('calc'); qs('#atkInput').value = p.name; closeModal(); };
  const teamBtn = el('button'); teamBtn.textContent='Seleccionar en Team';
  teamBtn.onclick = ()=> { switchModule('team'); closeModal(); };
  btns.appendChild(addBtn); btns.appendChild(calcBtn); btns.appendChild(teamBtn);
  modalBody.appendChild(btns);

  showModal();
}

function showModal(){ modal.classList.add('show'); modal.setAttribute('aria-hidden','false') }
function closeModal(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true') }

/* -------------------------
    TEAM BUILDER
    ------------------------- */
const teamSlotsEl = qs('#teamSlots');
function renderTeam(){
  teamSlotsEl.innerHTML = '';
  for(let i=0;i<6;i++){
    const slot = el('div','slot');
    slot.dataset.index = i;
    const content = state.team[i];
    if(content){
      const img = el('img'); img.src = content.sprite; slot.appendChild(img);
      const nm = el('div','name'); nm.textContent = toTitle(content.name); slot.appendChild(nm);
      const rem = el('button'); rem.textContent='X'; rem.style.marginTop='6px';
      rem.onclick = ()=> { state.team[i]=null; saveTeam(); renderTeam(); };
      slot.appendChild(rem);
    } else {
      const add = el('div','small'); add.textContent='Vacío';
      slot.appendChild(add);
    }
    // allow drop
    slot.addEventListener('dragover', (ev)=> ev.preventDefault());
    slot.addEventListener('drop', (ev)=> {
      const payload = ev.dataTransfer.getData('text/pokemon');
      if(payload){
        const p = JSON.parse(payload);
        state.team[i]=p;
        saveTeam();
        renderTeam();
      }
    });
    // click to choose from pokedex (select)
    slot.onclick = async ()=> {
      const name = prompt('Introduce nombre o id del Pokémon para el slot '+(i+1));
      if(name) {
        try{
          const p = await fetchPokemonFull(name);
          state.team[i]=p; saveTeam(); renderTeam();
        }catch(e){ alert('No encontrado: '+e.message) }
      }
    }
    teamSlotsEl.appendChild(slot);
  }
  updateTeamSummary();
  qs('#teamCount').textContent = state.team.filter(Boolean).length;
}

function addToTeam(pok){
  // add to first empty slot
  const idx = state.team.findIndex(x=>!x);
  if(idx===-1){
    alert('Equipo lleno. Borra un slot primero.');
    return;
  }
  state.team[idx]=pok;
  saveTeam();
  renderTeam();
  alert(`${toTitle(pok.name)} añadido al slot ${idx+1}`);
}

function saveTeam(){
  localStorage.setItem('poketeam_v1', JSON.stringify(state.team));
}
function loadTeam(){
  const raw = localStorage.getItem('poketeam_v1');
  if(!raw) return Array(6).fill(null);
  try{
    const parsed = JSON.parse(raw);
    // ensure length 6
    while(parsed.length<6) parsed.push(null);
    return parsed.slice(0,6);
  }catch(e){ return Array(6).fill(null) }
}

function updateTeamSummary(){
  const summary = qs('#teamSummary');
  const members = state.team.filter(Boolean);
  if(!members.length){ summary.textContent='Agrega Pokémon para ver el resumen.'; return; }
  // compute combined types and weaknesses (basic)
  const typeCounts = {};
  members.forEach(m => m.types.forEach(t => typeCounts[t]=(typeCounts[t]||0)+1));
  const typesStr = Object.entries(typeCounts).map(([t,c])=>`${toTitle(t)}(${c})`).join(', ');
  summary.innerHTML = `<strong>Miembros:</strong> ${members.map(m=>toTitle(m.name)).join(', ')}<br>
                        <strong>Tipos representados:</strong> ${typesStr}`;
}

qs('#clearTeam').onclick = ()=> {
  if(confirm('Borrar equipo guardado?')) {
    state.team = Array(6).fill(null);
    saveTeam();
    renderTeam();
  }
}

qs('#exportTeam').onclick = ()=> {
  const data = JSON.stringify(state.team, null, 2);
  const w = window.open("about:blank","export");
  w.document.write(`<pre>${escapeHtml(data)}</pre>`);
}

qs('#importTeamBtn').onclick = async ()=> {
  const txt = prompt('Pega JSON del equipo (array de pokémon)'); 
  if(!txt) return;
  try{
    const arr = JSON.parse(txt);
    // minimal validation
    if(!Array.isArray(arr)) throw new Error('Formato incorrecto');
    state.team = arr.slice(0,6).map(x=>x||null);
    saveTeam(); renderTeam();
    alert('Equipo importado.');
  }catch(e){ alert('Error importando: '+e.message) }
}


/* -------------------------
    DAMAGE CALC (LITE)
    ------------------------- */
qs('#calcBtn').onclick = async ()=>{
  const atkName = qs('#atkInput').value.trim();
  const defName = qs('#defInput').value.trim();
  const level = Number(qs('#levelInput').value)||50;
  const power = Number(qs('#movePower').value)||60;
  const moveType = qs('#moveType').value.trim().toLowerCase() || 'normal';

  if(!atkName || !defName){ alert('Introduce atacante y defensor'); return; }
  try{
    const atk = await fetchPokemonFull(atkName);
    const def = await fetchPokemonFull(defName);
    const atkStat = atk.stats['attack'] || atk.stats['special-attack'] || 100;
    const defStat = def.stats['defense'] || def.stats['special-defense'] || 100;
    // Base formula simplified
    const base = Math.floor(( ( (2*level)/5 + 2) * power * (atkStat/defStat) ) / 50) + 2;

    // STAB
    const stab = atk.types.includes(moveType) ? 1.5 : 1.0;

    // effectiveness (basic): check defender types against moveType using small table (we'll request type damage relations)
    const effectiveness = await computeEffectiveness(moveType, def.types);

    const total = Math.max(1, Math.round(base * stab * effectiveness));
    qs('#calcResult').innerHTML = `<strong>Estimación:</strong> ${total} de daño (base=${Math.round(base)}, STAB=${stab}, multiplier=${effectiveness})<br>
                                   <small>Atacante: ${toTitle(atk.name)} | Defensor: ${toTitle(def.name)}</small>`;
  }catch(e){ alert('Error: '+e.message) }
}

async function computeEffectiveness(moveType, defTypes){
  // Fetch type info from API and compute multiplier
  try{
    const data = await fetchJSON(`${API_BASE}/type/${moveType}`);
    // data.damage_relations: double_damage_to, half_damage_to, no_damage_to
    // But we need damage_relations... we must compute defender receives multiplier:
    // For defender types, we need the reverse relations (double_damage_from etc) - fortunately API provides those
    // data.damage_relations.double_damage_to -> targets this move is strong against (we need defender types)
    // Simpler: for each def type, fetch its damage_relations and combine double_damage_from etc.
    let mult = 1;
    for(const dt of defTypes){
      const tdata = await fetchJSON(`${API_BASE}/type/${dt}`);
      const doubles = tdata.damage_relations.double_damage_from.map(x=>x.name);
      const halves = tdata.damage_relations.half_damage_from.map(x=>x.name);
      const zeros = tdata.damage_relations.no_damage_from.map(x=>x.name);
      if(zeros.includes(moveType)) mult *= 0;
      else if(doubles.includes(moveType)) mult *= 2;
      else if(halves.includes(moveType)) mult *= 0.5;
      else mult *= 1;
    }
    return mult;
  }catch(e){
    // fallback neutral
    return 1;
  }
}

/* -------------------------
    WHO'S THAT GAME
    ------------------------- */
qs('#newRound').onclick = ()=> startNewRound();
qs('#guessBtn').onclick = ()=> makeGuess();
qs('#guessInput').addEventListener('keydown', (e)=> { if(e.key==='Enter') makeGuess(); });

async function startNewRound(){
  // pick a random pokemon from cached list or fetch a random id
  let p;
  if(pokemons.length){
    p = pokemons[Math.floor(Math.random()*pokemons.length)];
  } else {
    const randomId = Math.floor(Math.random()*386)+1; // gen1-3
    p = await fetchPokemonFull(randomId);
  }
  state.currentGame = p;
  const img = qs('#gameSprite');
  img.src = p.sprite;
  img.classList.add('hidden');
  qs('#gameMsg').textContent = 'Adivina...';
  qs('#guessInput').value = '';
}

function makeGuess(){
  const g = qs('#guessInput').value.trim().toLowerCase();
  if(!state.currentGame){ alert('Inicia una ronda primero'); return; }
  if(!g) return;
  if(g === state.currentGame.name.toLowerCase()){
    qs('#gameMsg').textContent = `Correcto — era ${toTitle(state.currentGame.name)}!`;
    qs('#gameSprite').classList.remove('hidden');
  } else {
    qs('#gameMsg').textContent = `Nope — ${g} no es. Intenta otra vez.`;
  }
}

/* -------------------------
    MAP
    ------------------------- */
qsAll = (sel)=> Array.from(document.querySelectorAll(sel));
qsa('.city').forEach(city=>{
  city.addEventListener('click', ()=> {
    const name = city.dataset.city;
    const info = qs('#cityInfo');
    if(name==='pallet') info.innerHTML = '<strong>Pallet Town</strong><br>Hometown. Líder: Prof. Oak (no hay gimnasio). Pokémon comunes: Pidgey, Rattata.';
    if(name==='viridian') info.innerHTML = '<strong>Viridian City</strong><br>Gimnasio: Líder tradicional (solo en algunos juegos). Pokémon comunes: Rattata, Nidoran.';
    if(name==='cerulean') info.innerHTML = '<strong>Cerulean City</strong><br>Gimnasio de Misty (tipo agua). Pokémon comunes: Staryu, Goldeen.';
  });
});

/* -------------------------
    UI / NAV
    ------------------------- */
qsa('.nav-link').forEach(n=> n.addEventListener('click', ()=> {
  qsa('.nav-link').forEach(x=> x.classList.remove('active'));
  n.classList.add('active');
  switchModule(n.dataset.module);
}));

function switchModule(name){
  qsa('.module').forEach(m=> m.style.display='none');
  qs(`#module-${name}`).style.display = 'block';
}

qs('#loadMore').onclick = ()=> loadAndRenderNext();
qs('#refreshBtn').onclick = ()=> { offset=0; pokemons=[]; loadAndRenderNext(); };
qs('#searchInput').addEventListener('input', (e)=> {
  const q = e.target.value.trim().toLowerCase();
  let arr = pokemons.slice();
  if(q){
    arr = arr.filter(p => p.name.includes(q) || String(p.id)===q);
  }
  const type = qs('#typeFilter').value;
  if(type) arr = arr.filter(p => p.types.includes(type));
  const sort = qs('#sortSelect').value;
  if(sort==='name') arr.sort((a,b)=>a.name.localeCompare(b.name));
  else arr.sort((a,b)=>a.id - b.id);
  renderPokedex(arr);
});

qs('#typeFilter').addEventListener('change', ()=> qs('#searchInput').dispatchEvent(new Event('input')));
qs('#sortSelect').addEventListener('change', ()=> qs('#searchInput').dispatchEvent(new Event('input')));

/* -------------------------
    INICIALIZACIÓN
    ------------------------- */
async function init(){
  // load types
  try{
    typesList = await fetchTypes();
    const sel = qs('#typeFilter');
    typesList.forEach(t=> { const o = el('option'); o.value=t; o.textContent=toTitle(t); sel.appendChild(o) });
  }catch(e){}
  // load initial pokedex
  await loadAndRenderNext();
  await loadAndRenderNext(); // load two pages to have variety
  renderTeam();
  // quick safety: start a game sprite placeholder
  startNewRound();
}

init();

/* -------------------------
    Pequeñas ayudas: permitir drag drop desde imágenes en modal
    ------------------------- */
// allow dragging from modal sprite to team
modalBody.addEventListener('dragstart', (ev)=> {
  // noop
});

// close modal on background click
modal.addEventListener('click', (ev)=> {
  if(ev.target === modal) closeModal();
});

// keyboard esc
window.addEventListener('keydown', (e)=> { if(e.key==='Escape') closeModal(); });