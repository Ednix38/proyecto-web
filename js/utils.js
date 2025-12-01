// Estado global
const API_BASE = 'https://pokeapi.co/api/v2';
const perPage = 24;

let offset = 0;
let pokemons = [];
let typesList = [];

const state = {
  shown: [],
  team: [],          // <- vacío por ahora
  currentGame: null
};

// Helpers
function qs(sel, root=document) { return root.querySelector(sel) }
function qsa(sel, root=document) { return Array.from(root.querySelectorAll(sel)) }
function el(tag, cls=''){ const e=document.createElement(tag); if(cls) e.className=cls; return e }
function toTitle(s){ return s ? s.charAt(0).toUpperCase()+s.slice(1) : '' }
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;') }
