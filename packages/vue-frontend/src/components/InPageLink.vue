<template>

<a :href="href" @click.prevent="scrollIntoView"><slot /></a>

</template>

<script>
export default {
  props: {
    href: {
      type: String,
      required: true
    }
  },
  methods: {
    scrollIntoView (event) {
      event.preventDefault()
      const el = document.querySelector(this.href)
      el.scrollIntoView()
      el.focus()
    }
  }
}
</script>
