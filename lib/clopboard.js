const { CompositeDisposable } = require('atom')

module.exports = {
    active: false,
    history: null,
    disposables: null,
    clopboard: null,
    activate(state) {
        this.active = true

        const copied = this.clipboard
        this.history = copied ? [copied] : []

        this.disposables = new CompositeDisposable()
        this.disposables.add(atom.commands.add('atom-workspace', {
            'clopboard:paste': state => {
                this.paste(state)
            },
            'clopboard:copy': state => {
                this.copy(state)
            }
        }))
    },
    get view() {
        if (!this.clopboard) {
            const ClopboardView = require('./clopboard-view')
            this.clopboard = new ClopboardView({
                initialHistory: this.history,
                onSelect: this.select
            })
        }
        return this.clopboard
    },
    get clipboard() {
        return atom.clipboard.read()
    },
    deactivate() {
        this.disposables.dispose()
        if (this.clopboard) {
            this.clopboard.destroy()
            this.clopboard = null
        }
        this.history = null
        this.active = false
    },
    copy(state) {
        atom.commands.dispatch(state.originalEvent.target, 'core:copy')
        const copied = this.clipboard
        if (copied) {
            this.history.push(copied)
            this.view.setItems(this.history)
        }
        return state
    },
    paste(state) {
        this.view.toggle()
        return state
    },
    select(item) {
        atom.workspace.getActivePaneItem().insertText(item)
    },
    serialize() {}
}
