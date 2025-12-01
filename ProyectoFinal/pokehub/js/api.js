async function fetchJSON(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error("Fetch error " + res.status);
  return res.json();
}

async function fetchPokemonList(limit=perPage, off=offset){
  const data = await fetchJSON(`${API_BASE}/pokemon?limit=${limit}&offset=${off}`);
  return data.results;
}

async function fetchPokemonFull(nameOrId){
  const d = await fetchJSON(`${API_BASE}/pokemon/${nameOrId.toString().toLowerCase()}`);
  return {
    id: d.id,
    name: d.name,
    types: d.types.map(t => t.type.name),
    sprite: d.sprites.other['official-artwork'].front_default || d.sprites.front_default,
    stats: d.stats.reduce((o,s)=> (o[s.stat.name]=s.base_stat,o), {}),
    moves: d.moves.map(m => m.move.name),
    weight: d.weight,
    height: d.height
  };
}

async function fetchTypes(){
  const data = await fetchJSON(API_BASE+'/type');
  return data.results.map(r=>r.name);
}
