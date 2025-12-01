/* main.js
   Bootstrapping: load types, initial pages, init team, render UI
*/
async function init(){
  try{
    // load types and populate filter
    typesList = await fetchTypes();
    const sel = qs('#typeFilter');
    typesList.forEach(t=> { const o = el('option'); o.value=t; o.textContent=toTitle(t); sel.appendChild(o) });
  }catch(e){
    console.warn('No se pudieron cargar tipos:', e.message);
  }

  // load initial pokedex pages
  await loadAndRenderNext();
  await loadAndRenderNext();

  // init team AFTER loadTeam defined
  initTeam();
  renderTeam();

  // placeholder game
  startNewRound();
}

// start
init();
