const { $$, SelectListView } = require('atom-space-pen-views')

module.exports =
class ClopboardView extends SelectListView {
    constructor(history) {
        super()
        this.editor = null
        this.forceClear = false
        this.workspaceView = atom.views.getView(atom.workspace)
        this.history = history || []
    }

    // Public methods
    // ##############################
    initialize() {
        super.initialize(...arguments)
        this.addClass('clopboard')
        return this._handleEvents()
    }

    copy() {
        this.storeFocusedElement()
        this.editor = atom.workspace.getActiveTextEditor()

        if (this.editor) {
            let selectedText = this.editor.getSelectedText()
            if (selectedText.length) {
                return this._add(selectedText)
            } else if (atom.config.get('clopboard.enableCopyLine')) {
                // @editor.buffer.beginTransaction()
                const originalPosition = this.editor.getCursorBufferPosition()
                this.editor.selectLinesContainingCursors()
                selectedText = this.editor.getSelectedText()
                this.editor.setCursorBufferPosition(originalPosition)
                // @editor.buffer.commitTransaction()
                if (selectedText.length) {
                    atom.clipboard.metadata = atom.clipboard.metadata || {}
                    atom.clipboard.metadata.fullline = true
                    atom.clipboard.metadata.fullLine = true
                    return this._add(selectedText, atom.clipboard.metadata)
                }
            }
        }
    }

    paste() {
        let exists = false
        const clipboardItem = atom.clipboard.read()

        // Check OS clipboard
        if (clipboardItem.length && !this.forceClear) {
            for (let item of this.history) {
                if (item.text === clipboardItem) {
                    exists = true
                }
            }
            if (!exists) {
                this._add(clipboardItem)
            }
        }

        // Attach to view
        if (this.history.length) {
            this.setItems(this.history.slice(0).reverse())
        } else {
            this.setError('There are no items in your clipboard.')
        }
        return this._attach()
    }

    // Overrides (Select List)
    // ##############################
    viewForItem({ text, date, clearHistory }) {
        if (clearHistory) {
            return $$(function() {
                return this.li({ class: 'two-lines text-center' }, () => {
                    return this.span(text)
                })
            })
        } else {
            text = this._limitString(text, 65)
            date = this._timeSince(date)
            return $$(function() {
                return this.li({ class: 'two-lines' }, () => {
                    this.div({ class: 'pull-right secondary-line' }, () => {
                        return this.span(date)
                    })
                    this.span(text.limited)

                    // Preview
                    if (atom.config.get('clopboard.showSnippetForLargeItems')) {
                        return this.div(
                            { class: 'preview hidden panel-bottom padded' },
                            () => {
                                return this.pre(text.initial)
                            }
                        )
                    }
                })
            })
        }
    }

    selectItemView(view) {
        if (!view.length) { // Default behaviour
            return
        }
        this.list.find('.selected').removeClass('selected')
        view.addClass('selected')
        this.scrollToItemView(view)

        // Show preview
        this.list.find('.preview').addClass('hidden')
        const preview = view.find('.preview')
        if (preview.length && preview.text().length > 65 && atom.config.get('clopboard.showSnippetForLargeItems')) {
            if (view.position().top !== 0) {
                preview.css({ 'top': `${view.position().top - 5}px` })
            }
            return preview.removeClass('hidden')
        }
    }

    confirmed(item) {
        if (item.clearHistory) {
            this.history = []
            this.forceClear = true
        } else {
            this.history.splice(this.history.indexOf(item), 1)
            this.history.push(item)
            atom.clipboard.write(item.text)
            atom.workspace.getActivePaneItem().insertText(item.text, { select: true })
        }
        return this.cancel()
    }

    getFilterKey() {
        return 'text'
    }

    cancelled() {
        return this.panel ? this.panel.hide() : undefined
    }

    // Helper methods
    // #############################
    _add(element, metadata) {
        atom.clipboard.write(element, metadata || {})
        this.forceClear = false
        if (this.history.length && atom.config.get('clopboard.showClearHistoryButton')) {
            this.history.push({
                text: 'Clear History',
                clearHistory: true
            })
        }
        return this.history.push({ text: element, date: Date.now() })
    }

    _handleEvents() {
        atom.commands.add('atom-workspace', {
            'clopboard:copy': event => {
                return this.copy()
            }
        })
        return atom.commands.add('atom-workspace', {
            'clopboard:paste': event => {
                if (this.panel && this.panel.isVisible()) {
                    return this.cancel()
                } else {
                    return this.paste()
                }
            }
        })
    }

    _setPosition() {
        return this.panel.item.parent().css({
            'margin-left': 'auto',
            'margin-right': 'auto',
            top: 200,
            bottom: 'inherit'
        })
    }

    _attach() {
        this.panel = !this.panel
            ? atom.workspace.addModalPanel({ item: this })
            : this.panel
        this._setPosition()
        this.panel.show()
        return this.focusFilterEditor()
    }

    _timeSince(date) {
        if (date) {
            const seconds = Math.floor((new Date() - date) / 1000)
            let interval = Math.floor(seconds / 3600)
            if (interval > 1) {
                return `${interval} hours ago`
            }
            interval = Math.floor(seconds / 60)
            if (interval > 1) {
                return `${interval} minutes ago`
            }
            if (seconds > 0) {
                return `${Math.floor(seconds)} seconds ago`
            }
            return 'now'
        }
    }

    _limitString(string, limit) {
        return {
            initial: string,
            limited: string.length > limit
                ? `${string.substr(0, limit)} ...`
                : string
        }
    }
}
