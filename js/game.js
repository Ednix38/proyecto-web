/* game.js
Who's That Pokémon? Mejorado
*/

qs('#newRound').onclick = ()=> startNewRound();
qs('#guessBtn').onclick = ()=> makeGuess();

// Botón de rendirse
const giveUpBtn = el('button');
giveUpBtn.textContent = 'Rendirse';
giveUpBtn.style.marginLeft = '8px';
qs('#guessBtn').parentNode.appendChild(giveUpBtn);
giveUpBtn.onclick = ()=> giveUp();

qs('#guessInput').addEventListener('keydown', (e)=> { if(e.key==='Enter') makeGuess(); });

async function startNewRound(){
const img = qs('#gameSprite');

// resetear estado de sprite: silueta negra
img.classList.add('silhouette');
img.style.filter = ''; // permite que la clase CSS haga efecto
img.classList.add('hidden');

// pequeño delay para permitir transición
setTimeout(async () => {
let p;
if(pokemons.length){
p = pokemons[Math.floor(Math.random()*pokemons.length)];
} else {
const randomId = Math.floor(Math.random()*386)+1; // gen1-3
p = await fetchPokemonFull(randomId);
}
state.currentGame = p;

// cargar nueva imagen
img.src = p.sprite;

// forzar reflujo para que la transición se aplique
void img.offsetWidth;

// mostrar silueta
img.classList.remove('hidden');

qs('#gameMsg').textContent = 'Adivina...';
qs('#guessInput').value = '';

}, 300);
}

function makeGuess(){
const g = qs('#guessInput').value.trim().toLowerCase();
if(!state.currentGame){ alert('Inicia una ronda primero'); return; }
if(!g) return;

if(g === state.currentGame.name.toLowerCase()){
qs('#gameMsg').textContent = `Correcto — era ${toTitle(state.currentGame.name)}!`;
revealSprite();
} else {
qs('#gameMsg').textContent = `Nope — ${g} no es. Intenta otra vez.`;
}
}

function giveUp(){
if(!state.currentGame){ alert('Inicia una ronda primero'); return; }
qs('#gameMsg').textContent = `Te rendiste — era ${toTitle(state.currentGame.name)}.`;
revealSprite();
}

// Muestra la imagen real quitando la silueta
// Reveal sprite mantiene como antes
function revealSprite(){
const img = qs('#gameSprite');
img.classList.remove('hidden');
img.classList.remove('silhouette');
img.style.filter = 'none';
}