const mapData = {
  pallet: {
    name: 'Pallet Town',
    type: 'Pueblo',
    location: 'Kanto',
    generation: 'I',
    img: '<a href="https://pokemondb.net/pokedex/ivysaur"><img src="https://img.pokemondb.net/sprites/x-y/normal/ivysaur.png" alt="Ivysaur"></a>',
    commonPokemons: ['Pidgey','Rattata'],
    leader: 'N/A'
  },

  viridian: {
    name: 'Viridian City',
    type: 'Ciudad',
    location: 'Kanto',
    generation: 'I',
    img: 'https://archives.bulbagarden.net/media/upload/3/3a/Viridian_City_PE.png',
    commonPokemons: ['Rattata','Nidoran'],
    leader: 'Giovanni (Tierra)'
  },

  pewter: {
    name: 'Pewter City',
    type: 'Ciudad',
    location: 'Kanto',
    generation: 'I',
    img: 'https://archives.bulbagarden.net/media/upload/c/cd/Pewter_City_PE.png',
    commonPokemons: ['Spearow','Jigglypuff'],
    leader: 'Brock (Roca)'
  },

  cerulean: {
    name: 'Cerulean City',
    type: 'Ciudad',
    location: 'Kanto',
    generation: 'I',
    img: 'https://archives.bulbagarden.net/media/upload/f/f0/Cerulean_City_PE.png',
    commonPokemons: ['Goldeen','Magikarp'],
    leader: 'Misty (Agua)'
  },

  vermilion: {
    name: 'Vermilion City',
    type: 'Ciudad',
    location: 'Kanto',
    generation: 'I',
    img: 'https://archives.bulbagarden.net/media/upload/e/e2/Vermilion_City_PE.png',
    commonPokemons: ['Tentacool','Magikarp'],
    leader: 'Lt. Surge (Eléctrico)'
  },

  lavender: {
    name: 'Lavender Town',
    type: 'Pueblo',
    location: 'Kanto',
    generation: 'I',
    img: 'https://archives.bulbagarden.net/media/upload/9/9d/Lavender_Town_PE.png',
    commonPokemons: ['Gastly (Torre Pokémon)'],
    leader: 'N/A'
  },

  celadon: {
    name: 'Celadon City',
    type: 'Ciudad',
    location: 'Kanto',
    generation: 'I',
    img: 'https://archives.bulbagarden.net/media/upload/f/fd/Celadon_City_PE.png',
    commonPokemons: ['Pidgey','Meowth'],
    leader: 'Erika (Planta)'
  },

  fuchsia: {
    name: 'Fuchsia City',
    type: 'Ciudad',
    location: 'Kanto',
    generation: 'I',
    img: 'https://archives.bulbagarden.net/media/upload/3/33/Fuchsia_City_PE.png',
    commonPokemons: ['Venonat','Doduo'],
    leader: 'Koga (Veneno)'
  },

  saffron: {
    name: 'Saffron City',
    type: 'Ciudad',
    location: 'Kanto',
    generation: 'I',
    img: 'https://archives.bulbagarden.net/media/upload/e/eb/Saffron_City_PE.png',
    commonPokemons: ['Pidgey','Mr. Mime'],
    leader: 'Sabrina (Psíquico)'
  },

  cinnabar: {
    name: 'Cinnabar Island',
    type: 'Isla',
    location: 'Kanto',
    generation: 'I',
    img: 'https://archives.bulbagarden.net/media/upload/a/ae/Cinnabar_Island_PE.png',
    commonPokemons: ['Magmar','Ponyta'],
    leader: 'Blaine (Fuego)'
  },

  indigo: {
    name: 'Indigo Plateau',
    type: 'Meseta',
    location: 'Kanto',
    generation: 'I',
    img: 'https://archives.bulbagarden.net/media/upload/3/3f/Indigo_Plateau_PE.png',
    commonPokemons: [],
    leader: 'Alto Mando'
  }
};

qsa('.city').forEach(city => {
  city.addEventListener('click', () => {
    const key = city.dataset.city;
    const info = qs('#cityInfo');
    const data = mapData[key];

    if (data) {
      info.innerHTML = `
        <img src="${data.img}" alt="${data.name}" style="width:200px;height:auto;border-radius:8px;margin-bottom:8px">
        <strong>${data.name}</strong> (${data.type})<br>
        Ubicación: ${data.location}<br>
        Generación: ${data.generation}<br>
        Líder/Gimnasio: ${data.leader}<br>
        Pokémon comunes: ${data.commonPokemons.join(', ')}
      `;
    } else {
      info.innerHTML = 'Información no disponible.';
    }
  });
});
