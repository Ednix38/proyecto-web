/* calc.js
   Damage calculator (lite) + effectiveness helper
*/

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

    const base = Math.floor(( ( (2*level)/5 + 2) * power * (atkStat/defStat) ) / 50) + 2;
    const stab = atk.types.includes(moveType) ? 1.5 : 1.0;
    const effectiveness = await computeEffectiveness(moveType, def.types);

    const total = Math.max(1, Math.round(base * stab * effectiveness));
    qs('#calcResult').innerHTML = `<strong>Estimación:</strong> ${total} de daño (base=${Math.round(base)}, STAB=${stab}, multiplier=${effectiveness})<br>
                                   <small>Atacante: ${toTitle(atk.name)} | Defensor: ${toTitle(def.name)}</small>`;
  }catch(e){ alert('Error: '+e.message) }
}

/* computeEffectiveness: checks moveType vs defender types by querying each defender type
   Returns multiplier (e.g., 0, 0.5, 1, 2, 4 ...)
*/
async function computeEffectiveness(moveType, defTypes){
  try{
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
    return 1; // fallback neutral
  }
}
