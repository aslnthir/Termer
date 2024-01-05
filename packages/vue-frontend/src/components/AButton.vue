<license>
  Vertraulich
</license>

<docs>
A button element that appears visually as a link.
</docs>

<template>
  <button type="button" @click="x => this.$emit('click', x)" :title="title">
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'a-button',
  props: ['title']
}
</script>

<style lang="sass" scoped>
button
  appearance: none
  border: none
  box-shadow: none
  cursor: pointer
  display: inline
  font: inherit
  padding: 0
  text-align: left
  background: inherit
  text-decoration: none
  color: #0047b1
  background-color: transparent
</style>
