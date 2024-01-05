<license>
  Vertraulich
</license>

<template>
  <editor-inline
    v-if="inline"
    :value="myValue"
    @input="onInput"
    @save="onSave"
  />
  <editor-box
    v-else
    :value="myValue"
    @input="onInput"
    @save="onSave"
  />
</template>

<script>
import editorInline from './EditorInline.vue'
import editorBox from './EditorBox.vue'

export default {
  name: 'editor',
  components: {
    editorInline,
    editorBox
  },
  props: ['value', 'inline'],
  data () {
    return {
      myValue: this.value
    }
  },
  methods: {
    onInput (v) {
      this.$emit('input', v)
    },
    onSave (v) {
      this.myValue = v
      this.$emit('save', v)
    }
  }
}
</script>
