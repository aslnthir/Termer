<license>
  Vertraulich
</license>

<template>
<div name="addUserFeilds" class="addUserFeild">
  <div class="halfSpaceing">
    <p class="errorMessage">{{ errorMsg }}</p>
    <input class="fullWidth" name="userNameField" type="text" @change="sendEvent" v-model="userName" />
  </div>
  <div class="quaterSpaceing">
    <input name="read_access" type="checkbox" v-model="checked_read" v-bind:disabled="checked_write" />
  </div>
  <div class="quaterSpaceing">
    <input name="write_access" type="checkbox" v-model="checked_write" />
  </div>
</div>
</template>

<script>

export default {
  name: 'addUserField',
  data () {
    return {
      isEmpty: true,
      userName: '',
      checked_write: false,
      checked_read: false,
      errorMsg: ''
    }
  },
  computed: {
    GlossaryAPI () {
      return this.$store.getters.GlossaryAPI
    },
    sourceID () {
      return this.$route.params.glossary
    }
  },
  created: function () {
    window.eventBus.$on('sendSharedUser', this.sendSharedUser)
  },
  components: {
  },
  events: {
  },
  methods: {
    sendEvent (e) {
      const newVal = e.target.value === ''
      if (this.isEmpty !== newVal) {
        this.isEmpty = newVal
        this.$emit('childStatus', { status: this.isEmpty })
      }
    },
    sendInSharedUser () {
      if (!(this.userName && (this.checked_read || this.checked_write))) return

      const userToAdd = {
        user: this.userName,
        write_access: this.checked_write,
        glossary_source: this.sourceID
      }

      this.GlossaryAPI.addSharedAccess(userToAdd)
        .then(response => {
          this.sendAddedEvent()
        }).catch(response => {
          const responseDict = response.error
          if ('non_field_errors' in responseDict) {
            this.errorMsg = 'Glossary already shared with this user.'
          } else if ('user' in responseDict) {
            this.errorMsg = 'User do not exist.'
          } else {
            this.errorMsg = 'Glossary could not be shared with user.'
          }
        })
    },
    sendSharedUser () {
      this.sendInSharedUser()
    },
    sendAddedEvent () {
      window.eventBus.$emit('newUserAdded')
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.thirdSpaceing
  display: inline-block
  width: 100%
.addUserFeild
  border: 1px solid #ccc
  border-radius: 16px
.errorMessage
  color: red
.halfSpaceing
  display: inline-block
  width: 44%
  min-width: 42px
.quaterSpaceing
  display: inline-block
  width: 25%
.fullWidth
  width: 100%
</style>
    }
