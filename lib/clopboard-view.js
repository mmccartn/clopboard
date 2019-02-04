const SelectListView = require('atom-select-list')

module.exports =
class ClopboardView {
    constructor({ initialHistory, onSelect }) {
        this.items = initialHistory || []
        this.onSelect = onSelect
        this.selectListView = new SelectListView({
            items: this.items,
            maxResults: 10,
            elementForItem: (item, options) => {
                return new ClopboardItem(item).element
            },
            didCancelSelection: () => { this.cancel() },
            didConfirmSelection: item => { this.confirm(item) }
        })
    }

    get element() {
        return this.selectListView.element
    }

    toggle() {
        if (this.panel && this.panel.isVisible()) {
            this.cancel()
        } else {
            if (this.items.length) {
                this.show()
                this.setItems(this.items)
            }
        }
    }

    confirm(item) {
        this.onSelect(item)
        this.cancel()
    }

    show() {
        this.previouslyFocusedElement = document.activeElement
        if (!this.panel) {
            this.panel = atom.workspace.addModalPanel({ item: this })
        }
        this.panel.show()
        this.selectListView.focus()
    }

    hide() {
        if (this.panel) {
            this.panel.hide()
        }
        if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus()
            this.previouslyFocusedElement = null
        }
    }

    destroy() {
        if (this.panel) {
            this.panel.destroy()
        }
        return this.selectListView.destroy()
    }

    setItems(items) {
        this.items = items
        return this.selectListView.update({ items: this.items, loadingMessage: null, loadingBadge: null })
    }

    cancel() {
        this.selectListView.reset()
        this.hide()
    }
}

class ClopboardItem {
    constructor(text) {
        this.element = document.createElement('li')
        this.element.appendChild(document.createTextNode(text))
    }
}
