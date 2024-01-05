<license>
  Vertraulich
</license>

<template>
  <span>
    <span v-if="state === 'modified'">Modified</span>
    <span v-else-if="state === 'processing'">Processing …</span>
    <span v-else-if="state === 'updated'">Saved!</span>
    <span v-else-if="state === 'failed'">Error :(</span>
    <span v-else-if="typeof state === 'string'">{{ state }}</span>
  </span>
</template>

<script>
export default {
  name: 'editing-state',
  props: ['state']
}
</script>
