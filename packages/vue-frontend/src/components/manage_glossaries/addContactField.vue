<license>
  Vertraulich
</license>

<template>
    <tr name="addUserFeilds">
      <td>
        <input :title="$t('Username of user')" :value="user.username" class="textInput fullWidth" readonly />
      </td>
      <td>
        <input :title="$t('Share glossary with user')" name="read_access" type="checkbox" v-model="checked_read" @change="readCheckboxEvent" />
      </td>
      <td>
        <input :title="$t('Give user read and write access')" name="write_access" type="checkbox" v-model="checked_write" @change="writeCheckboxEvent" />
      </td>
    </tr>
</template>

<script>

export default {
  name: 'addUserField',
  props: ['user', 'sharedUsers', 'glossary'],
  data () {
    return {
      checked_write: this.user.write_access,
      checked_read: this.user.shared_id !== null,
      isEmpty: true,
      userID: this.user.id,
      shared_id: this.user.shared_id
    }
  },
  computed: {
    GlossaryAPI () {
      return this.$store.getters.GlossaryAPI
    },
    sourceID () {
      if (this.glossary) return this.glossary
      return this.$route.params.glossary
    },
    userToAdd () {
      const user = {
        user: this.userID,
        write_access: this.checked_write,
        glossary_source: this.sourceID
      }
      return user
    }
  },
  watch: {
    // checked_write: 'writeCheckboxEvent',
    // checked_read: 'readCheckboxEvent'
  },
  created: function () {
    // this.checkIfShared()
  },
  components: {
  },
  methods: {
    updateUsers () {

    },
    readCheckboxEvent () {
      if (this.shared_id) {
        if (!this.checked_read) {
          this.removeSharedUser()
          this.checked_write = false
        }
      } else {
        this.setSharedAccess()
      }
    },
    writeCheckboxEvent () {
      if (this.shared_id) {
        if (this.checked_read) {
          this.changeWriteAccess()
        }
      } else if (this.checked_write) {
        this.setSharedAccess()
      }
    },
    setSharedAccess () {
      this.GlossaryAPI.addSharedAccess(this.userToAdd)
        .then(response => {
          this.shared_id = response.id
          this.checked_read = true
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
    changeWriteAccess () {
      const data = { write_access: this.checked_write }
      this.GlossaryAPI.updateSharedAccess(this.shared_id, data)
    },
    removeSharedUser () {
      this.GlossaryAPI.deleteSharedAccess(this.shared_id)
        .then(response => {
          this.shared_id = null
        })
    }
  }
}
</script>

<!-- "scoped" attribute limits CSS to this component only -->
<style lang="sass" scoped>
.textInput
  border: none
  display: inline
  font-family: inherit
  font-size: inherit
  padding: 0px
  background: inherit
.addUserFeild
  border: 1px solid #ccc
  border-radius: 16px
  min-height: 39px
.halfSpaceing
  display: inline-block
  width: 44%
.quaterSpaceing
  display: inline-block
  width: 25%
  min-width: 42px
.tripleContainer
  display: flex
.fullWidth
  width: 100%
.minSize
  min-width: 200px
tr:nth-child(even)
  background: rgb(224, 224, 219)
tr:nth-child(odd)
  background: #fffde9
</style>
