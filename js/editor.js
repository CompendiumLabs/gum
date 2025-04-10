// readonly config compartment
const editableCompartment = new cm.Compartment;
const readOnlyCompartment = new cm.Compartment;

// get text from state object
function getText(state) {
    return state.doc.toString();
}

// for javascript editing
function createEditState(text='', update=null) {
    const extensions = [
        cm.javascript(),
        cm.history(),
        cm.drawSelection(),
        cm.lineNumbers(),
        cm.EditorView.lineWrapping,
        cm.bracketMatching(),
        cm.indentUnit.of('    '),
        cm.keymap.of([
            cm.indentWithTab,
            ...cm.defaultKeymap,
            ...cm.historyKeymap,
        ]),
        cm.syntaxHighlighting(cm.defaultHighlightStyle),
        editableCompartment.of(cm.EditorView.editable.of(true)),
        readOnlyCompartment.of(cm.EditorState.readOnly.of(false)),
    ];
    if (update != null) {
        extensions.push(cm.EditorView.updateListener.of(upd => {
            if (upd.docChanged) {
                const text = getText(upd.state);
                update(text);
            }
        }));
    }
    return cm.EditorState.create({
        doc: text,
        extensions
    });
}

// for svg output
function createReadonlyState(text='') {
    return cm.EditorState.create({
        doc: text,
        extensions: [
            cm.xml(),
            cm.drawSelection(),
            cm.syntaxHighlighting(cm.defaultHighlightStyle),
            cm.EditorView.editable.of(false),
            cm.EditorState.readOnly.of(true),
        ],
    });
}

class CodeMirror {
    constructor(parent, readOnly=false, update=null) {
        const State = readOnly ? createReadonlyState : createEditState;
        this.makeState = text => State(text, update);
        this.editor = new cm.EditorView({
            state: this.makeState(''),
            parent: parent,
        });
    }

    setEditable(editable) {
        this.editor.dispatch({
            effects: [
                editableCompartment.reconfigure(cm.EditorView.editable.of(editable)),
                readOnlyCompartment.reconfigure(cm.EditorState.readOnly.of(!editable)),
            ]
        });
    }

    getText() {
        return getText(this.editor.state);
    }

    setText(text, reset=true) {
        if (reset) {
            this.editor.setState(this.makeState(text));
        } else {
            this.editor.dispatch({
                changes: {from: 0, to: this.editor.state.doc.length, insert: text}
            });
        }
    }
}

class GumEditor {
    constructor(code, conv, disp, execute, args) {
        // default args
        const {
            stat = null,
            store = null,
        } = args ?? {};

        // set up variables
        this.code = code;
        this.conv = conv;
        this.disp = disp;
        this.execute = execute;
        this.stat = stat;
        this.store = store;

        // init editor
        this.editor = new CodeMirror(code, false, text => this.updateView(text));
        if (conv != null) {
            this.svgout = new CodeMirror(conv, true);
        } else {
            this.svgout = null;
        }
    }

    setEditable(editable) {
        this.editor.setEditable(editable);
    }

    setStore(src) {
        if (this.store != null) {
            this.store(src);
        }
    }

    setCode(src, reset=true) {
        this.editor.setText(src, reset);
        this.updateView(src);
    }

    getConvert() {
        if (this.svgout == null) {
            return null;
        }
        return this.svgout.getText();
    }

    setConvert(text) {
        if (this.svgout == null) {
            return;
        }
        this.svgout.setText(text);
    }

    setDisplay(svg) {
        this.disp.classList.remove('error');
        this.disp.innerHTML = svg;
        this.addSvgBorder();
    }

    addSvgBorder() {
        const svg = this.disp.querySelector('svg');
        if (svg == null) {
            return;
        }

        // get svg dimensions
        const [x, y, w, h] = svg.getAttribute('viewBox').split(' ').map(Number);

        // add border
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute('id', 'border');
        rect.setAttribute('x', `${x + 1}px`);
        rect.setAttribute('y', `${y + 1}px`);
        rect.setAttribute('width', `${w - 2}px`);
        rect.setAttribute('height', `${h - 2}px`);
        rect.setAttribute('fill', 'white');
        rect.setAttribute('stroke', '#ccc');
        rect.setAttribute('stroke-width', '1');
        svg.insertBefore(rect, svg.firstChild);
    }

    setState(good) {
        if (this.stat == null) {
            return;
        }
        if (good == null) {
            this.stat.classList = [];
        } else if (good) {
            this.stat.classList = ['good'];
        } else {
            this.stat.classList = ['bad'];
        }
    }

    updateView(src) {
        // store source
        this.setStore(src);

        // execute code
        let data;
        try {
            data = this.execute(src);
        } catch (err) {
            this.setConvert(err.message);
            return;
        }

        // set display
        this.setConvert(data);
        this.setDisplay(data);
    }
}

/*
 * resize helper
 */

function enableResize(left, right, mid) {
    function resizePane(evt) {
        const pos = evt.clientX;
        const base = left.getBoundingClientRect().left;
        const wind = window.innerWidth;
        const lw = Math.max(200, pos - 2 - base);
        const rw = Math.max(200, wind - pos - 2);
        left.style.width = `${lw}px`;
        right.style.width = `${rw}px`;
    }
    
    mid.addEventListener('mousedown', evt => {
        document.addEventListener('mousemove', resizePane, false);
    }, false);
    
    document.addEventListener('mouseup', evt => {
        document.removeEventListener('mousemove', resizePane, false);
    }, false);
}

export { GumEditor, enableResize }