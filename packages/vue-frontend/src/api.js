import { TermerAPI } from 'glossaryapi-client'

const api = new TermerAPI()

export default function apifactory () {
  return {
    auth,
    user
  }
}

const auth = {
  // auth API module
  login () {
    return api.loginUser(...arguments)
  },
  logout () {
    return api.logoutUser(...arguments)
  },
  getLoggedInUser () {
    return api.getLoggedInUser(...arguments)
  },
  async changePassword (payload) {
    try {
      const response = await api.changePassword(payload)
      return { response }
    } catch (error) {
      return { error }
    }
  }
}

const user = {
  // user module
  fetchUser,
  pushData
}

async function updateLanguage (api, language) {
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  const options = { headers, stringify: false }
  const data = { language }
  return api.setLanguage(data, options)
}

async function fetchUser () {
  let language
  // if (GlossaryStorage) {
  //   language = await GlossaryStorage.getSessionLanguage()
  // }

  // Note: Duplicate API call, see getLoggedInUser() above.
  // They are used for different things.
  // Here: to get the user info.
  // In auth: to check if the user is logged in or not.
  const user = await api.getLoggedInUser(...arguments)
  if (language) {
    user.usersettings.language = language
  }

  let s = user.usersettings
  if (s) {
    s = s.stored_selected_glossaries
    if (s) {
      s = s.tingtunDefault
      if (s) {
        const selectedGlossaries = JSON.parse(localStorage.getItem('SelectedGlossaries'))
        selectedGlossaries.tingtunDefault = s
        localStorage.setItem('SelectedGlossaries', JSON.stringify(selectedGlossaries))
      }
    }
  }

  return user
}

async function pushData (data) {
  const userId = data.id
  const userSettings = data.usersettings
  // XXX: this localStorage handling code does not belong here. It should live
  // in some external module which handles settings.

  const s = userSettings.stored_selected_glossaries.tingtunDefault
  const selectedGlossaries = JSON.parse(localStorage.getItem('SelectedGlossaries') || '{}')
  selectedGlossaries.tingtunDefault = s
  localStorage.setItem('SelectedGlossaries', JSON.stringify(selectedGlossaries))

  // XXX: Language is not part of usersettings glossary API.
  // But should it be?
  let language = userSettings.language
  if (typeof language !== 'string') {
    language = ''
  }
  // GlossaryStorage.setSessionLanguage({ 'value': language })
  await updateLanguage(api, language)

  const email = data.email
  if (email && data.emailcheck && email !== data.emailcheck) {
    api.updateEmail({ email })
    data.emailcheck = email
  }

  // Make a deep copy of the settings object so we can adapt it for sending.
  // The JSON trick looks weird, but is suggested at MDN
  // (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Deep_Clone)
  const userSettingsCopy = JSON.parse(JSON.stringify(userSettings))
  // Encode this field as JSON because the API server expects it to be that
  // way.
  userSettingsCopy.stored_selected_glossaries = JSON.stringify(
    userSettingsCopy.stored_selected_glossaries)
  return api.updateUserSettings(userId, userSettingsCopy)
}
