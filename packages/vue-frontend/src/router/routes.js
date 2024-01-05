/*
 * Vertraulich
 */

import store from '@/store'

// const CreateNewEntry = () => import(/* webpackChunkName: "createnew" */
//   '@/views/CreateNewEntry'
// )
const Config = () => import(/* webpackChunkName: "config" */ '@/views/Config')

const Search = () => import(/* webpackChunkName: "search" */ '@/views/Search')
const Lookup = () => import(/* webpackChunkName: "lookup" */ '@/views/Lookup')
const Showcase = () => import(/* webpackChunkName: "showcase" */
  '@/views/Showcase'
)
const ShowcaseSearch = () => import(/* webpackChunkName: "showcase" */
  '@/views/ShowcaseSearch'
)
// const UserConfig = () => import(/* webpackChunkName: "userconfig" */
//   '@/views/UserConfig'
// )

const PdfReader = () => import(/* webpackChunkName: "pdfreader" */
  '@/views/PdfReader'
)

// Chunk "glossaries"
// const Share = () => import(/* webpackChunkName: "manage" */
//   '@/views/manage_glossaries/share'
// )
const ManageGlossaries = () => import(/* webpackChunkName: "manage" */
  '@/views/manage_glossaries/manageGlossaries'
)
// End chunk "manage"

// Chunk "login"
const CreateUser = () => import(/* webpackChunkName: "login" */
  '@/views/user_login/createUser'
)
const VerifyEmail = () => import(/* webpackChunkName: "login" */
  '@/views/user_login/verifyEmail'
)
const Login = () => import(/* webpackChunkName: "login" */
  '@/views/user_login/login'
)
const Logout = () => import(/* webpackChunkName: "login" */
  '@/views/user_login/logout'
)
const LoginOptions = () => import(/* webpackChunkName: "login" */
  '@/views/user_login/loginOptions'
)
const PasswordRecovery = () => import(/* webpackChunkName: "login" */
  '@/views/user_login/passwordRecovery'
)
const PasswordRecoveryConfirm = () => import(/* webpackChunkName: "login" */
  '@/views/user_login/passwordRecoveryConfirm'
)
const PasswordChange = () => import(/* webpackChunkName: "login" */
  '@/views/user_login/passwordChange'
)
// End chunk "login"

// Chunk "static-pages"
const PrivacyStatement = () => import(/* webpackChunkName: "static-pages" */
  '@/views/PrivacyStatement'
)
const HelpPage = () => import(/* webpackChunkName: "static-pages" */
  '@/views/HelpPage'
)
const AboutPage = () => import(/* webpackChunkName: "static-pages" */
  '@/views/AboutPage'
)
const TermsOfUse = () => import(/* webpackChunkName: "static-pages" */
  '@/views/TermsOfUse'
)
const Thanks = () => import(/* webpackChunkName: "static-pages" */
  '@/views/Thanks'
)
const DemoPage = () => import(
  '@/components/DemoPage'
)
const InstallAddon = () => import(/* webpackChunkName: "static-pages" */
  '@/views/InstallAddon'
)
const InstallApp = () => import(/* webpackChunkName: "static-pages" */
  '@/views/InstallApp'
)
const TingtunHomePage = () => import(/* webpackChunkName: "static-pages" */
  '@/views/HomePage'
)
const InstallationGuide = () => import(/* webpackChunkName: "static-pages" */
  '@/views/SiteInstallation'
)
const InstallSiteINSITU = () => import(/* webpackChunkName: "static-pages" */
  '@/views/InstallSiteINSITU'
)
const InstallBookmarklet = () => import(/* webpackChunkName: "static-pages" */
  '@/views/InstallBookmarklet'
)
const DetailedBookmarkletInstallationInstructions = () => import(/* webpackChunkName: "static-pages" */
  '@/views/DetailedBookmarkletInstallationInstructions'
)
const View404 = () => import(/* webpackChunkName: "static-pages" */
  '@/views/404'
)
const Empty = () => import(/* webpackChunkName: "static-pages" */
  '@/views/Empty'
)
const SearchResults = () => import(/* webpackChunkName: "search-results" */
  '@/components/SearchResults'
)
const ContactPage = () => import(
  '@/views/Contact'
)
const FeedbackPage = () => import(
  '@/views/FeedbackPage'
)
const NewsPage = () => import(
  '@/views/NewsPage'
)
const ExercisePage = () => import(
  '@/views/ExercisePage'
)
const TestInformationPage = () => import(
  '@/views/TestInformationPage'
)
const FaqComponent = () => import(
  '@/components/FaqComponent'
)
// End chunk "static-pages"

const GlossaryCompare = () => import('@/views/manage_glossaries/glossary_compare')

const SearchLayout = () => import('@/layouts/SearchPage')
const LookupLayout = () => import('@/layouts/LookupPage')

export default [
  {
    path: '/search/:term?',
    component: Search,
    meta: { layout: SearchLayout },
    name: 'search',
    props: true,
    handler: termSearchHandler
  },
  // { path: '/new/:lemma', component: CreateNewEntry, props: true, meta: { requiresAuth: true } },

  {
    path: '/lookup/:term',
    component: Lookup,
    meta: { layout: LookupLayout },
    name: 'lookup',
    props: true,
    handler: termSearchHandler
  },
  // { path: '/manage/share/:glossary', component: Share, name: 'share', meta: { requiresAuth: true } },

  {
    path: '/config/',
    component: Config,
    name: 'config',
    props: true,
    children: [
      {
        path: 'search/:term',
        name: 'config-search',
        components: { 'search-results': SearchResults },
        props: { 'search-results': true },
        handler: termSearchHandler
      }
    ]
  },
  { path: '/manage/glossaries/', component: ManageGlossaries, name: 'manage', meta: { requiresAuth: true } },
  { path: '/compare/', component: GlossaryCompare, name: 'glossaryCompare' },
  { path: '/site_installation/', component: InstallationGuide, name: 'installguide' },
  { path: '/site_install/', component: InstallSiteINSITU, name: 'InstallSiteINSITU' },

  // User authentication
  { path: '/registration/', component: CreateUser, name: 'createUser' },
  { path: '/registration/verify-email/:key', component: VerifyEmail, name: 'verifyEmail' },
  { path: '/login/termer/', component: Login, name: 'login' },
  { path: '/login/', component: LoginOptions, name: 'loginOptions' },
  { path: '/logout/', component: Logout, name: 'logout', meta: { requiresAuth: true } },
  { path: '/password/recovery/', component: PasswordRecovery, name: 'passwordRecovery' },
  { path: '/password/recovery/confirm/:uid/:token', component: PasswordRecoveryConfirm, name: 'passwordRecoveryConfirm', meta: { requiresAuth: true } },
  { path: '/password/change/', component: PasswordChange, name: 'passwordChange', meta: { requiresAuth: true } },
  // { path: '/usersettings/', component: UserConfig, name: 'userSettings', meta: { requiresAuth: true } },

  { path: '/privacy/', component: PrivacyStatement, name: 'privacyStatement' },
  { path: '/help/', component: HelpPage, name: 'help' },
  { path: '/about/', component: AboutPage, name: 'about' },
  { path: '/contact/', component: ContactPage, name: 'contact' },
  { path: '/tos/', component: TermsOfUse, name: 'termsOfUse' },
  { path: '/thanks/', component: Thanks, name: 'thanks' },
  { path: '/feedback/', component: FeedbackPage, name: 'feedback' },
  { path: '/addon/', component: InstallAddon, name: 'installAddon' },
  { path: '/bookmarklet/', component: InstallBookmarklet, name: 'installBookmarklet' },
  { path: '/install/', component: InstallBookmarklet, name: 'installBookmarklet2' },
  { path: '/bookmarklet/instructions/', component: DetailedBookmarkletInstallationInstructions, name: 'bookmarklet-detailed' },
  { path: '/app/', component: InstallApp, name: 'installApp' },
  { path: '/news/', component: NewsPage, name: 'news' },
  { path: '/exercise/', component: ExercisePage, name: 'exercise' },
  { path: '/', component: TingtunHomePage, name: 'Home' },
  { path: '/empty', name: 'empty', component: Empty },
  { path: '/test', name: 'test-information', component: TestInformationPage },
  { path: '/faq', name: 'faq', component: FaqComponent },
  {
    path: '/pdfreader',
    component: PdfReader,
    name: 'pdfreader'
  },
  { path: '/demo', component: DemoPage, name: 'demo' },

  {
    path: '/showcase',
    component: Showcase,
    props: true,
    meta: { layout: SearchLayout },
    children: [
      { path: '', redirect: 'search' },
      {
        path: 'search/:term?',
        component: ShowcaseSearch,
        meta: { layout: SearchLayout },
        name: 'showcase-search',
        props: true,
        handler: termSearchHandler
      },
      {
        path: 'pdfreader',
        component: PdfReader,
        meta: { layout: SearchLayout },
        name: 'showcase-pdfreader'
      }
    ]
  },

  // Default fallback route (like a 404 “page not found” page)
  { path: '*', component: View404, name: '404' }
]

function termSearchHandler (to) {
  const term = (to.params.term || '').trim()
  if (term) {
    store.dispatch('Termer/search', term)
  }
}
