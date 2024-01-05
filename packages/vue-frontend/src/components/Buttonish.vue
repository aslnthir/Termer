<license>
  Vertraulich
</license>

<docs>
A <router-link> styled to appear as a button.
</docs>

<template>
  <router-link
    v-if="to"
    :to="to"
    :title="title">
    <slot></slot>
  </router-link>
  <a
    v-else
    tabindex="0"
    @click="x => this.$emit('click', x)"
    :title="title">
    <slot></slot>
  </a>
</template>

<script>
export default {
  name: 'Buttonish',
  props: ['to', 'title', 'click']
}
</script>

<style lang="sass" scoped>
a  // router-link == a
  border: thin solid
  border-radius: 5px
  border-color: black
  box-shadow: 5px 5px 5px #d0cccc
  display: inline-block
  min-width: 300px
  margin: 0.5em
  padding: 0.5em
  color: white
  background-color: #18587b
  cursor: pointer
  &:focus
    background-color: #303
  &.big
    margin: 2em
    padding: 1em
</style>
