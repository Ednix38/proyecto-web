const modal = qs('#modal');
const modalTitle = qs('#modalTitle');
const modalBody = qs('#modalBody');

qs('#modalClose').onclick = ()=> closeModal();

function openModalForPokemon(p){
  modalTitle.textContent = `#${p.id} ${toTitle(p.name)}`;
  modalBody.innerHTML = '';

  const wrap = el('div','flex');
  const left = el('div','col');
  const img = el('img'); img.src = p.sprite;
  left.append(img);

  const right = el('div','col');
  const types = el('div','types');
  p.types.forEach(t=>{
    const tp = el('div','type');
    tp.textContent = toTitle(t);
    types.append(tp);
  });

  right.append(types);

  const statsBox = el('div','small');
  for(const [k,v] of Object.entries(p.stats)){
    const row = el('div');
    row.innerHTML =
      `<strong>${toTitle(k)}</strong> <span style="float:right">${v}</span>
       <div class="statbar"><div class="statfill" style="width:${Math.min(100,v)}%"></div></div>`;
    statsBox.append(row);
  }
  right.append(statsBox);

  wrap.append(left,right);
  modalBody.append(wrap);

  const btns = el('div','flex');
  const addBtn = el('button'); addBtn.textContent='Añadir al equipo';
  addBtn.onclick = ()=>{ addToTeam(p); closeModal(); };
  const calcBtn = el('button'); calcBtn.textContent='Abrir Damage Calc';
  calcBtn.onclick = ()=>{ switchModule('calc'); qs('#atkInput').value=p.name; closeModal(); };
  const teamBtn = el('button'); teamBtn.textContent='Seleccionar en Team';
  teamBtn.onclick = ()=>{ switchModule('team'); closeModal(); };

  btns.append(addBtn, calcBtn, teamBtn);
  modalBody.append(btns);

  showModal();
}

function showModal(){
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}
function closeModal(){
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
}

// esc + click fondo
modal.addEventListener('click', ev=>{ if(ev.target===modal) closeModal() });
window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal() });
