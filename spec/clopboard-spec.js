// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('Clopboard', () => {
    let workspaceElement, activationPromise

    beforeEach(() => {
        workspaceElement = atom.views.getView(atom.workspace)
        activationPromise = atom.packages.activatePackage('clopboard')
    })

    describe('when the clopboard:copy event is triggered', () => {
        it('copys', () => {
            atom.commands.dispatch(workspaceElement, 'clopboard:copy')
        })

        xit('hides and shows the view', () => {
            // This test shows you an integration test testing at the view level.

            // Attaching the workspaceElement to the DOM is required to allow the
            // `toBeVisible()` matchers to work. Anything testing visibility or focus
            // requires that the workspaceElement is on the DOM. Tests that attach the
            // workspaceElement to the DOM are generally slower than those off DOM.
            jasmine.attachToDOM(workspaceElement)

            expect(workspaceElement.querySelector('.clopboard')).not.toExist()

            // This is an activation event, triggering it causes the package to be
            // activated.
            atom.commands.dispatch(workspaceElement, 'clopboard:toggle')

            waitsForPromise(() => {
                return activationPromise
            })

            runs(() => {
                // Now we can test for view visibility
                let clopboardElement = workspaceElement.querySelector('.clopboard')
                expect(clopboardElement).toBeVisible()
                atom.commands.dispatch(workspaceElement, 'clopboard:toggle')
                expect(clopboardElement).not.toBeVisible()
            })
        })
    })
})
