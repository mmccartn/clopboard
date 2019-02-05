const { CompositeDisposable } = require('atom')

module.exports = {
    active: false,
    history: null,
    disposables: null,
    clopboard: null,
    activate(state) {
        this.active = true
        this.history = new History()
        this.disposables = new CompositeDisposable()
        const copied = this.clipboard
        if (copied) {
            this.history.add(copied)
        }
        this.disposables.add(atom.commands.add('atom-workspace', {
            'clopboard:paste': this.paste.bind(this),
            'clopboard:copy': this.copy.bind(this)
        }))
    },
    get view() {
        if (!this.clopboard) {
            const ClopboardView = require('./clopboard-view')
            this.clopboard = new ClopboardView({
                initialHistory: this.history,
                onSelect: this.select.bind(this)
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
            this.history.add(copied)
            this.view.setItems(this.history)
        }
        return state
    },
    paste(state) {
        this.view.toggle()
        return state
    },
    select(item) {
        atom.workspace.getActivePaneItem().insertText(item.text)
        this.history.delete(item)
    },
    serialize() {}
}

class History extends Array {
    constructor(elementLimit = 8, ageLimit = 60) {
        super()
        this._elementLimit = elementLimit
        this._ageLimit = ageLimit
    }

    get _now() {
        return Date.now()
    }

    _isElementAtIndexStale(index) {
        return (Math.abs(this._now - this[index].time) / 1000) > this._ageLimit
    }

    _prune() {
        while (this.length > 0 && this[0] && this._isElementAtIndexStale(0)) {
            this.pop()
        }
    }

    _elementWithText(text) {
        return this.find(element => element.text === text)
    }

    add(text) {
        this._prune()
        if (this.length >= this._elementLimit) {
            this.pop()
        }
        if (!this._elementWithText(text)) {
            this.unshift({ text, time: this._now })
        }
    }

    delete(element) {
        const index = this.indexOf(element)
        return index > 0 ? this.splice(index, 1)[0] : element
    }
}
