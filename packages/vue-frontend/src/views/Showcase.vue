<license>
  Vertraulich
</license>

<template>
<keep-alive><!-- XXX: keep-alive does not work for PdfReader as it is contained in an iframe. -->
  <router-view></router-view>
</keep-alive>
</template>

<script>
export default {
  name: 'showcase',
  metaInfo () {
    return {
      meta: [{
        name: 'keywords',
        content: 'tingtunlookup'
      }]
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
$tingtunBlue: rgb(5,94,144)

h1
  font-weight: bold
  font-size: 133%
  color: var(--invert-text-color)
  margin: 0
  padding-left: 1em
  padding-bottom: 0.1em
  padding-top: 0.3em
  display: inline-block

.menu
  background-color: $tingtunBlue
  margin-bottom: 0.2em
  text-align: left
  display: flex
  flex-direction: row

.pdfViewer
  display: inline

.dropMenu
  display: inline
  color: var(--invert-text-color)
  margin-left: auto

.centered
  text-align: center
  margin: 0 auto

.centered-v
  display: flex
  flex-direction: column

.fullheight
  height: 100%

.top
  flex: 1

.jumbo, .jumbo *
  font-size: 2rem
  display: inline
  overflow: initial

.select-text
  margin-bottom: 0.2em
  margin-top: 0.2em
  margin-left: 0.2em

.glossary-select
  margin-left: 0.5em
  margin-right: 0.5em
  text-align: left
  border-color: black
  border: solid thin
  padding: 0.4em
  border-radius: 0.5em
  background-color: #f0f0f0

.bottom-page
  padding-bottom: 0.5em
  padding-right: 1em
  width: 100%
  background-color: #fffde9

.content
  margin-left: 0.5em
  margin-right: 0.5em
  display: flex
  flex-direction: column
  height: 100%

.top-menu
  margin-left: auto

.openButton
  margin-top: 5px

// .bottom-margin
//   margin-bottom: 130px

</style>
