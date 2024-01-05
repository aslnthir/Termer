<license>
  Vertraulich
</license>

<template>
  <div>
    <editor v-model="meaning"
            :inline="inline"
            @save="onSave"
            @input="onInput"
      ></editor>
  </div>
</template>

<script>
import Editor from './Editor'
export default {
  name: 'concept-editor',
  components: {
    Editor
  },
  props: ['value', 'inline'],
  computed: {
    meaning: {
      get () {
        return this.value.meaning
      },
      set (x) {
        this.$emit('input', x)
      }
    }
  },
  methods: {
    onInput (value) {
      this.$emit('input', this.postProcess(value))
    },
    onSave (value) {
      this.$emit('save', this.postProcess(value))
    },
    postProcess (value) {
      const trimmed = value.replace(/&nbsp;/g, ' ').trim()
      return trimmed
    }
    /*
    fixupImages (value) {
      // transform <p><img></p> to <img>.
      const tmp = document.createElement('div')
      tmp.innerHTML = value
      for (const img of tmp.querySelectorAll('p>img')) {
        const p = img.parentElement
        p.outerHTML = p.innerHTML
      }
      return tmp.innerHTML
    }
    */
  }
}
</script>
