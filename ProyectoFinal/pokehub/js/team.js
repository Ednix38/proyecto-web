/* team.js
   Team Builder: render, add, save, load, export/import, drag/drop
*/

const teamSlotsEl = qs('#teamSlots');

function loadTeam(){
  const raw = localStorage.getItem('poketeam_v1');
  if(!raw) return Array(6).fill(null);
  try{
    const parsed = JSON.parse(raw);
    while(parsed.length < 6) parsed.push(null);
    return parsed.slice(0,6);
  }catch(e){
    return Array(6).fill(null);
  }
}

function saveTeam(){
  localStorage.setItem('poketeam_v1', JSON.stringify(state.team));
}

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
        try{
          const p = JSON.parse(payload);
          state.team[i]=p;
          saveTeam();
          renderTeam();
        }catch(e){ /* ignore */ }
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
  const cEl = qs('#teamCount');
  if(cEl) cEl.textContent = state.team.filter(Boolean).length;
}

function addToTeam(pok){
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

function updateTeamSummary(){
  const summary = qs('#teamSummary');
  const members = state.team.filter(Boolean);
  if(!members.length){ summary.textContent='Agrega Pokémon para ver el resumen.'; return; }
  const typeCounts = {};
  members.forEach(m => m.types.forEach(t => typeCounts[t]=(typeCounts[t]||0)+1));
  const typesStr = Object.entries(typeCounts).map(([t,c])=>`${toTitle(t)}(${c})`).join(', ');
  summary.innerHTML = `<strong>Miembros:</strong> ${members.map(m=>toTitle(m.name)).join(', ')}<br>
                        <strong>Tipos representados:</strong> ${typesStr}`;
}

/* Buttons: clear, export, import */
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
    if(!Array.isArray(arr)) throw new Error('Formato incorrecto');
    state.team = arr.slice(0,6).map(x=>x||null);
    saveTeam(); renderTeam();
    alert('Equipo importado.');
  }catch(e){ alert('Error importando: '+e.message) }
}

/* initTeam: to be called from main.js so loadTeam runs after globals exist */
function initTeam(){
  // If state.team already set (rare), keep it; otherwise load from storage
  const stored = loadTeam();
  state.team = stored;
}
