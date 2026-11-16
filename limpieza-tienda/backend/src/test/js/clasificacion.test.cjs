const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '../../main/resources/static/js/app.js'), 'utf8');
const names = ['normalizarTexto', 'marcaCatalogoDesdeNombre', 'claveMarca', 'textoSeguro', 'renderClasificacion', 'renderGrid'];
const functions = names.map(name => {
  const start = source.indexOf(`  function ${name}(`);
  const end = source.indexOf('\n  }', start) + 4;
  return source.slice(start, end);
}).join('\n');
function Option(text, value) { this.textContent = text; this.value = value; }
const elements = {};
for (const id of ['filterMarca', 'filterSubcategoria', 'sectionTitle', 'productGrid']) {
  elements['#' + id] = { value: '', options: [], replaceChildren(...options) { this.options = options; }, get selectedOptions() { return this.options.filter(o => o.value === this.value); } };
}
const state = { filtro: 'todos', marcaCatalogo: 'SAPHIRUS', subcategoria: '', categorias: [], productos: [
  { id: 1, nombre: 'Lavanda', marca: 'Saphirus', subcategoria: 'Aerosoles' },
  { id: 2, nombre: 'Vainilla', marca: 'Saphirus', subcategoria: 'Difusores' },
  { id: 3, nombre: 'Pisos', marca: 'Poett', subcategoria: 'Limpiadores' },
  { id: 4, nombre: 'Especial', marca: 'Nueva marca', subcategoria: 'Otros' },
] };
const context = vm.createContext({ state, $: id => elements[id], Option, productoCard: p => `[${p.id}]` });
vm.runInContext(functions, context);
context.renderGrid();
assert.equal(elements['#productGrid'].innerHTML, '[1][2]');
assert.deepEqual(elements['#filterSubcategoria'].options.map(o => o.textContent), ['Todos los tipos', 'Aerosoles', 'Difusores']);
state.subcategoria = 'aerosoles'; context.renderGrid();
assert.equal(elements['#productGrid'].innerHTML, '[1]');
state.marcaCatalogo = 'poett'; context.renderGrid();
assert.equal(state.subcategoria, '');
assert.equal(elements['#productGrid'].innerHTML, '[3]');
state.marcaCatalogo = 'nueva marca'; context.renderGrid();
assert.equal(elements['#productGrid'].innerHTML, '[4]');
state.marcaCatalogo = null; context.renderGrid();
assert.equal(elements['#productGrid'].innerHTML, '[1][2][3][4]');
assert.equal(context.textoSeguro('<script>'), '&lt;script&gt;');
console.log('OK: marcas, tipos dependientes, cambio de marca, restablecimiento y texto seguro');
