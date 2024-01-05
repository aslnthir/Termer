<template>
  <button class="custom-button" v-bind="{...$props, ...$attrs}" v-on="$listeners"><slot /></button>
</template>

<style lang="sass">
button.custom-button
  font-size: inherit
  background-color: var(--button-background-color)
  color: var(--text-color)
  box-shadow: 1px 1px 2px -2px var(--button-shadow-color)
  background-image: linear-gradient(var(--button-backgrund-gradient) 50%, var(--button-backgrund-gradient-active))
  padding: .3em .6em
  border: 1px solid var(--button-border-color)
  border-radius: 3px
  &::-moz-focus-inner
    border: 0
  &:focus
    outline: 1px dotted var(--button-outline-focus)
    outline-offset: -1px
  &:active
    background-image: linear-gradient(var(--button-backgrund-gradient-active) 40%, var(--button-backgrund-gradient))
</style>
