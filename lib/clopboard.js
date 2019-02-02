import ClopboardView from './clopboard-view'
import { CompositeDisposable } from 'atom'

export default {

    clopboardView: null,
    modalPanel: null,
    subscriptions: null,

    activate(state) {
        this.clopboardView = new ClopboardView(state.clopboardViewState)
        this.modalPanel = atom.workspace.addModalPanel({
            item: this.clopboardView.getElement(),
            visible: false
        })

        // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
        this.subscriptions = new CompositeDisposable()

        // Register command that toggles this view
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'clopboard:toggle': () => this.toggle()
        }))
    },

    deactivate() {
        this.modalPanel.destroy()
        this.subscriptions.dispose()
        this.clopboardView.destroy()
    },

    serialize() {
        return {
            clopboardViewState: this.clopboardView.serialize()
        }
    },

    toggle() {
        console.info('Clopboard was toggled!')
        return (
            this.modalPanel.isVisible()
                ? this.modalPanel.hide()
                : this.modalPanel.show()
        )
    }

}
