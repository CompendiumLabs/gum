import { GumEditor, enableResize } from './editor.js'
import { renderGumSafe } from './gum.js';

// global elements
let code = document.querySelector('#code');
let disp = document.querySelector('#disp');
let stat = document.querySelector('#stat');

let list = document.querySelector('#list');
let left = document.querySelector('#left');
let right = document.querySelector('#right');
let mid = document.querySelector('#mid');

// fetcher
async function getData(url, json=false) {
    let resp = await fetch(url, {cache: 'reload'});
    if (resp.ok) {
        if (json) {
            return resp.json();
        } else {
            return resp.text();
        }
    } else {
        return null;
    }
}

let code_empty = '// no example code found';
async function loadEntry(name) {
    let name1 = name.toLowerCase();
    let text = await getData(`docs/text/${name1}.md`);
    left.innerHTML = marked.marked(text);
    let code = await getData(`docs/code/${name1}.js`) ?? code_empty;
    gum_editor.setCode(code);
}

function activateItem(item) {
    let name = item.getAttribute('name');
    items.forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    loadEntry(name);
}

function parseEntry(name0, type) {
    let [name, text] = Array.isArray(name0) ? name0 : [name0, name0];
    let item = document.createElement('div');
    item.setAttribute('name', name);
    item.classList.add('item');
    item.classList.add(type);
    item.innerText = text;
    return item;
}

// intercept to log errors
function renderEntry(code) {
    try {
        return renderGumSafe(code);
    } catch (err) {
        console.error(err);
        throw err;
    }
}

// resize panels
enableResize(left, right, mid);

// make the actual editor
let gum_editor = new GumEditor(code, null, disp, renderEntry, {stat});

// get docs data
let meta = await getData('docs/meta.json', true);

// parse meta data
let items = [].concat(...Object.entries(meta).map(([t, es]) => {
    let es1 = es.map(e => parseEntry(e, t));
    es1[es1.length-1].classList.add('last');
    return es1;
}));

// populate list
items.forEach(item => {
    item.addEventListener('click', evt => {
        let name = item.getAttribute('name');
        window.location.hash = `#${name}`;
    });
    list.append(item);
});

// find particular entires
function findItem(name) {
    let [isel, ..._] = items.filter(item => item.getAttribute('name') == name);
    return isel;
}

// activate item by name
function activateName(name) {
    if (name.length > 0) {
        let item = findItem(name);
        if (item != null) {
            activateItem(item);
            return true;
        }
    }
    return false;
}

// detect hash changes
window.addEventListener('hashchange', evt => {
    let url = new URL(evt.newURL);
    let targ = url.hash.slice(1);
    if (targ.length == 0) {
        window.location.hash = '#gum';
    } else {
        if (!activateName(targ)) {
            window.location = evt.oldURL;
        }
    }
});

// go to docs home
let targ = window.location.hash.slice(1);
if (targ.length == 0 || !activateName(targ)) {
    window.location.hash = '#gum';
}
