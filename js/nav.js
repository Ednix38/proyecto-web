/* nav.js
   Navigation: switch modules, highlight active
*/

qsa('.nav-link').forEach(n=> n.addEventListener('click', ()=> {
  qsa('.nav-link').forEach(x=> x.classList.remove('active'));
  n.classList.add('active');
  switchModule(n.dataset.module);
}));

function switchModule(name){
  qsa('.module').forEach(m=> m.style.display='none');
  const target = qs(`#module-${name}`);
  if(target) target.style.display = 'block';
}
