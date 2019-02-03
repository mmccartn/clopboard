const { CompositeDisposable } = require('atom')
const ClopboardView = require('./clopboard-view')

module.exports = {
    config: {
        showSnippetForLargeItems: {
            type: 'boolean',
            default: true,
            title: 'Show Snippet',
            description: 'When a long clipboard item, preview it a separate tooltip'
        },
        showClearHistoryButton: {
            type: 'boolean',
            default: true,
            title: 'Show Clear History',
            description: 'Display a button to clear your clipboard\'s history'
        },
        enableCopyLine: {
            type: 'boolean',
            default: true,
            title: 'Enable Copy Line',
            description: 'Copy the whole line when no selection'
        }
    },
    history: [],
    clipboard: null,
    subscriptions: null,
    activate() {
        this.subscriptions = new CompositeDisposable()
        this.clipboard = new ClopboardView(
            this.history,
            atom.workspace.getActivePaneItem()
        )
        return this.clipboard
    },
    deactivate() {
        return this.subscriptions.dispose()
    },
    serialize() {}
}
