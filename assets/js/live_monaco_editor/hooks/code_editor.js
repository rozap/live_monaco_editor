import CodeEditor from "../editor/code_editor"

const CodeEditorHook = {
  mounted() {
    // TODO: validate dataset
    const opts = JSON.parse(this.el.dataset.opts)

    this.codeEditor = new CodeEditor(
      this.el,
      this.el.dataset.path,
      this.el.dataset.value,
      opts
    )

    this.codeEditor.onMount((monaco) => {
      if (this.el.dataset.changeEvent && this.el.dataset.changeEvent !== "") {
        this.codeEditor.standalone_code_editor.onDidChangeModelContent(() => {
          this.pushEventTo(this.el, this.el.dataset.changeEvent, {
            value: this.codeEditor.standalone_code_editor.getValue(),
          })
        })
      }

      this.handleEvent(
        "lme:change_language:" + this.el.dataset.path,
        (data) => {
          const model = this.codeEditor.standalone_code_editor.getModel()

          if (model.getLanguageId() !== data.mimeTypeOrLanguageId) {
            monaco.editor.setModelLanguage(model, data.mimeTypeOrLanguageId)
          }
        }
      )

      this.handleEvent("lme:set_value:" + this.el.dataset.path, (data) => {
        this.codeEditor.standalone_code_editor.setValue(data.value)
      })

      this.el.querySelectorAll("textarea").forEach((textarea) => {
        textarea.setAttribute(
          "name",
          "live_monaco_editor[" + this.el.dataset.path + "]"
        )
      })

      this.el.removeAttribute("data-value")
      this.el.removeAttribute("data-opts")

      this.el.dispatchEvent(
        new CustomEvent("lme:editor_mounted", {
          detail: { hook: this, editor: this.codeEditor },
          bubbles: true,
        })
      )
    })

    if (!this.codeEditor.isMounted()) {
      this.codeEditor.mount()
    }
  },

  destroyed() {
    if (this.codeEditor) {
      this.codeEditor.dispose()
    }
  },
}

export { CodeEditorHook }
