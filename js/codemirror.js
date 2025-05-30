import { EditorView, drawSelection, keymap, lineNumbers } from '@codemirror/view'
import { EditorState, Compartment } from '@codemirror/state'
import { defaultKeymap, indentWithTab, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, indentUnit } from '@codemirror/language'
import { javascript } from '@codemirror/lang-javascript'
import { xml } from '@codemirror/lang-xml'

export {
    EditorView, EditorState, Compartment, drawSelection, keymap, lineNumbers, defaultKeymap,
    indentWithTab, indentUnit, history, historyKeymap, syntaxHighlighting, defaultHighlightStyle,
    bracketMatching, javascript, xml,
}
