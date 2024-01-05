Each item in this is has an "id", this determens the definition group it belongs to.

So for example "id": 6761 has an norwegian lemma "anfall", and in english it is
"attack, fit". And the word "beslag" is a different definition group with "id"
7191.

All items in a definition group as a type and sub_id.
Type is split in to by "-", the letter before is connected to what language.
The ending is what type of value is in the text.

note: english and norwegian bokmål sometimes change their language code letter

lem: lemma
kat: what type of word it us
def: definition of the word
eks: Example text with the word.
sms: synonym of the word(s)
mor: inflections of the lemma
utt: ---

Example lexin result:

[
  [
    { id: 6761, sub_id: 2, type: 'E-lem', text: 'anfall' },
    { id: 6761, sub_id: 5, type: 'B-lem', text: 'attack, fit' },
    { id: 6761, sub_id: 32, type: 'E-kat', text: 'subst' },
    { id: 6761, sub_id: 33, type: 'B-kat', text: 'noun' },
    {
      id: 6761,
      sub_id: 61,
      type: 'N-def',
      text: 'et (plutselig og kortvarig) utbrudd av f.eks. sykdom eller sinnsbevegelse'
    },
    {
      id: 6761,
      sub_id: 64,
      type: 'B-def',
      text: '(a sudden and transitory) onset of e.g. sickness or mental agitation'
    },
    { id: 6761, sub_id: 91, type: 'E-eks', text: 'få et anfall' },
    {
      id: 6761,
      sub_id: 94,
      type: 'B-eks',
      text: 'have an attack (fit)'
    },
    { id: 6761, sub_id: 122, type: 'E-sms', text: 'gallesteinsanfall' },
    {
      id: 6761,
      sub_id: 125,
      type: 'B-sms',
      text: 'attack of biliary colic'
    },
    { id: 6761, sub_id: 153, type: 'E-sms', text: 'raserianfall' },
    {
      id: 6761,
      sub_id: 156,
      type: 'B-sms',
      text: 'fit (outburst) of rage'
    },
    { id: 6761, sub_id: 183, type: 'N-sms', text: 'epilepsianfall' },
    {
      id: 6761,
      sub_id: 186,
      type: 'B-sms',
      text: 'epileptic fit, epileptic seizure'
    },
    {
      id: 6761,
      sub_id: 213,
      type: 'E-mor',
      text: 'anfallet anfall anfallene (el anfalla)'
    },
    { id: 6761, sub_id: 218, type: 'E-utt', text: 'anfal' },
    { id: 7191, sub_id: 2, type: 'E-lem', text: 'beslag' },
    {
      id: 7191,
      sub_id: 5,
      type: 'B-lem',
      text: 'confiscation, seizure'
    },
    { id: 7191, sub_id: 30, type: 'N-kom', text: 'pol-2' },
    { id: 7191, sub_id: 33, type: 'E-kat', text: 'subst' },
    { id: 7191, sub_id: 34, type: 'B-kat', text: 'noun' },
    {
      id: 7191,
      sub_id: 61,
      type: 'E-def',
      text: 'forvaring, konfiskering'
    },
    { id: 7191, sub_id: 91, type: 'E-eks', text: 'ta beslag i' },
    { id: 7191, sub_id: 94, type: 'B-eks', text: 'seize' },
    {
      id: 7191,
      sub_id: 122,
      type: 'E-eks',
      text: 'tollen gjorde sitt største beslag av heroin'
    },
    {
      id: 7191,
      sub_id: 125,
      type: 'B-eks',
      text: 'the customs seized the largest consignment of heroin (ever sent across the border)'
    },
    {
      id: 7191,
      sub_id: 153,
      type: 'E-mor',
      text: 'beslaget beslag beslagene (el beslaga)'
    },
    { id: 7191, sub_id: 158, type: 'E-utt', text: 'besl.a:g' }
  ]
]
