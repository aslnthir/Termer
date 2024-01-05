/* eslint-env jest */
import { oneLine } from 'common-tags'
import {
  findParagraph,
  extractParagraph,
  extractLawSummary,
  extractChapter
} from '../src/lawExtractor'

import getHTMLDocument from '../src/getHTMLDocument'

const MAX_AGE_SECONDS = 24 * 60 * 60

describe.only('extract chapter', () => {
  it('barnevernloven kapittel 4', async () => {
    const ref = {
      lovnavn: 'barnevernloven',
      kapittel: '4'
    }
    const document = await getHTMLDocument(
      'https://lovdata.no/dokument/NL/lov/1992-07-17-100',
      MAX_AGE_SECONDS
    )
    const expected = oneLine`
      <p>Ved anvendelse av bestemmelsene i dette kapitlet skal det legges
    avgjørende vekt på å finne tiltak som er til beste for barnet. Herunder
    skal det legges vekt på å gi barnet stabil og god voksenkontakt og
    kontinuitet i omsorgen.`
    const { extract } = extractChapter(ref, document)

    return expect(extract).toEqual(expected)
  })

  it('sivilbeskyttelsesloven kapittel VI A', async () => {
    const ref = {
      lovnavn: 'sivilbeskyttelsesloven',
      kapittel: 'VIA'
    }
    const document = await getHTMLDocument(
      'https://lovdata.no/dokument/NL/lov/2010-06-25-45',
      MAX_AGE_SECONDS
    )

    const expectedTitle = 'Kapittel VI A. Beskyttelse av europeisk kritisk infrastruktur'
    const { extract, title } = extractChapter(ref, document)

    const expectedExtract = oneLine`
    <p>Hvert enkelt departement skal identifisere og utpeke europeisk kritisk
    infrastruktur innen sitt myndighetsområde og som omfattes av virkeområdet
    til direktiv 2008/114/EF.
    <p>Eier eller operatør av objektet plikter overfor departementet å foreslå
    hvilke objekter som potensielt kan være europeisk kritisk
    infrastruktur.<p>Vurderingen skal skje på bakgrunn av sektorbaserte
    kriterier som tar hensyn til de særlige kjennetegn for de enkelte sektorer
    av europeisk kritisk infrastruktur.
    <p>Videre skal vurderingen skje på bakgrunn av følgende kriterier:
    <ol type=\"a\">
      <li>det potensielle antall omkomne eller sårede,
      <li>størrelsen på det økonomiske tapet og forringelse av varer og
      tjenester, herunder potensielle miljømessige konsekvenser, og
      <li>konsekvensene med hensyn til befolkningens tillit, fysiske lidelser og
      forstyrrelser i hverdagen, herunder bortfall av vesentlige tjenester.
    </ol>
    <p>For infrastrukturer som leverer viktige tjenester skal det tas hensyn til
    akseptabel tidsperiode for funksjonssvikt og mulighet til å gjenopprette
    funksjonaliteten.
    <p>Utpekingen skal skje på grunnlag av avtale med de EØS-statene som kan bli
    berørt i betydelig grad.
    <p>Kongen kan gi forskrifter med nærmere bestemmelser om utpeking av
    europeisk kritisk infrastruktur og hvilke sektorer som skal omfattes.
    `.replace(/\s*</g, '<')

    expect(extract).toEqual(expectedExtract)
    expect(title).toEqual(expectedTitle)
  })
})

describe('extract paragraph', () => {
  it('barnelova §2', async () => {
    const ref = {
      lovnavn: 'barnelova',
      paragraf: '§2'
    }
    const document = await getHTMLDocument(
      'https://lovdata.no/dokument/NL/lov/1981-04-08-7',
      MAX_AGE_SECONDS
    )
    const expected = oneLine`
      <p>Som mor til barnet skal reknast den kvinna som har fødd
      barnet.
      <p>Avtale om å føde eit barn for ei anna kvinne er ikkje bindande.
    `.replace(/\s*</g, '<')
    const { extract } = extractParagraph(findParagraph(ref, document))

    return expect(extract).toEqual(expected)
  })

  it('sivilbeskyttelsesloven', async () => {
    const document = await getHTMLDocument(
      'https://lovdata.no/dokument/NL/lov/2010-06-25-45',
      MAX_AGE_SECONDS
    )
    const expected = oneLine`
       <p>Lovens formål er å beskytte liv, helse, miljø, materielle verdier og
       kritisk infrastruktur ved bruk av ikke-militær makt når riket er i krig,
       når krig truer, når rikets selvstendighet eller sikkerhet er i fare, og
       ved uønskede hendelser i fredstid.`
    const { extract } = extractLawSummary(document)

    return expect(extract).toEqual(expected)
  })

  it('psykisk helsevernloven §1-1', async () => {
    const ref = {
      lovnavn: 'psykisk helsevernloven',
      paragraf: '§ 1-1'
    }
    const document = await getHTMLDocument(
      'https://lovdata.no/dokument/NL/lov/1999-07-02-62',
      MAX_AGE_SECONDS
    )
    const expected = oneLine`
      <p>Formålet med loven her er å sikre at etablering og gjennomføring av
      psykisk helsevern skjer på en forsvarlig måte og i samsvar med
      menneskerettighetene og grunnleggende rettssikkerhetsprinsipper. Det er et
      formål med reglene å forebygge og begrense bruk av tvang.
      <p>Helsehjelpen skal tilrettelegges med respekt for den enkeltes fysiske
      og psykiske integritet og så langt som mulig være i overensstemmelse med
      pasientens behov og selvbestemmelsesrett og respekten for menneskeverdet.
    `.replace(/\s*</g, '<')
    const { extract } = extractParagraph(findParagraph(ref, document))

    return expect(extract).toEqual(expected)
  })

  it('sivilbeskyttelsesloven § 25', async () => {
    const ref = {
      lovnavn: 'sivilbeskyttelsesloven',
      paragraf: '§ 25'
    }
    const document = await getHTMLDocument(
      'https://lovdata.no/dokument/NL/lov/2010-06-25-45',
      MAX_AGE_SECONDS
    )
    const expected = '§ 25. Rekvisisjon'
    const { title } = extractParagraph(findParagraph(ref, document))

    return expect(title).toEqual(expected)
  })

  it('definition list (alphabetic)', async () => {
    const ref = {
      lovnavn: 'strålevernloven ',
      paragraf: '§ 3'
    }
    const document = await getHTMLDocument(
      'https://lovdata.no/dokument/NL/lov/2000-05-12-36',
      MAX_AGE_SECONDS
    )
    const expected = oneLine`
    <p>I denne loven betyr
    <ol type="a">
      <li>stråling: Ioniserende og ikke-ioniserende stråling.
      <li>ioniserende stråling: Stråling fra radioaktivt stoff, røntgenstråling
          og partikkelstråling.
      <li>ikke-ioniserende stråling: Optisk stråling, radiofrekvent stråling,
          elektriske og magnetiske felt eller annen stråling med tilsvarende
          biologiske effekter samt ultralyd.
      <li>strålekilder: Radioaktive stoffer, varer eller utstyr inneholdende
          slike stoffer, samt anlegg, apparater eller utstyr som kan avgi
          stråling.
      <li>medisinsk strålebruk: Anvendelse av stråling på mennesker ved
          medisinsk undersøkelse og behandling, i forskning og ved undersøkelser
          i rettslig sammenheng.
      <li>avfallsdisponering: Enhver disponering av strålekilder etter endt
          bruk, herunder lagring, utslipp, deponering, returordning eller
          behandling som ordinært avfall.
    </ol>
    `.replace(/\s*</g, '<')
    const { extract } = extractParagraph(findParagraph(ref, document))

    return expect(extract).toEqual(expected)
  })

  it('definition list (numeric)', async () => {
    const ref = {
      lovnavn: 'smittevernloven',
      paragraf: '§ 1-3'
    }
    const document = await getHTMLDocument(
      'https://lovdata.no/dokument/NL/lov/1994-08-05-55',
      MAX_AGE_SECONDS
    )
    const expected = oneLine`
    <p>Med følgende uttrykk i loven her forstås:
    <ol type="1">
      <li>smittsom sykdom: en sykdom eller smittebærertilstand som er forårsaket
      av mikroorganismer eller andre smittestoff som kan overføres fra, til
      eller mellom mennesker.
      <li>smittet person: en person som har eller etter en faglig vurdering
      antas å ha en smittsom sykdom.
      <li>allmennfarlig smittsom sykdom: en sykdom som er særlig smittsom, eller
      som kan opptre hyppig, eller har høy dødelighet eller kan gi alvorlige
      eller varige skader, og som
      <ol type="a">
        <li>vanligvis fører til langvarig behandling, eventuelt
        sykehusinnleggelse, langvarig sykefravær eller rekonvalesens, eller
        <li>kan få så stor utbredelse at sykdommen blir en vesentlig belastning
        for folkehelsen, eller
        <li>utgjør en særlig belastning fordi det ikke fins effektive
        forebyggende tiltak eller helbredende behandling for den.
      </ol>
      <li>alvorlig utbrudd av allmennfarlig smittsom sykdom: et utbrudd eller
      fare for utbrudd som krever særlig omfattende tiltak. Helsedirektoratet
      kan i tvilstilfelle avgjøre når det foreligger et alvorlig utbrudd av
      allmennfarlig smittsom sykdom.
    </ol>
    `.replace(/\s*</g, '<')
    const { extract } = extractParagraph(findParagraph(ref, document))

    return expect(extract).toEqual(expected)
  })

  it('numbered sections', async () => {
    const ref = {
      lovnavn: 'lospliktforskriften',
      paragraf: '§ 1'
    }
    const document = await getHTMLDocument(
      'https://lovdata.no/dokument/SF/forskrift/2014-12-17-1808',
      MAX_AGE_SECONDS
    )
    const expected = oneLine`
    <ol type="1">
      <li>Forskriften gjelder i sjøterritoriet og i de indre farvann, samt i
      Skienselva opp til Klosterfossen og slusene i Skien, Glomma opp til
      Sarpsborg (Melløs) og Vesterelva opp til Åsgårdsøra.
      <li>Forskriften gjelder ikke for militære fartøy og andre fartøy under
      militær kommando.
    </ol>
    `.replace(/\s*</g, '<')
    const { extract } = extractParagraph(findParagraph(ref, document))

    return expect(extract).toEqual(expected)
  })

  it('returns null on nonexistent §', async () => {
    const ref = {
      lovnavn: 'sivilbeskyttelsesloven',
      paragraf: '§ 9001'
    }
    const document = await getHTMLDocument(
      'https://lovdata.no/dokument/NL/lov/2010-06-25-45',
      MAX_AGE_SECONDS
    )
    const expected = null
    const result = extractParagraph(findParagraph(ref, document))

    return expect(result).toEqual(expected)
  })
})

/*
describe('lovnavn 1', () => {
  test.each([
    'lov 18. desember 2009 nr. 131 om sosiale tjenester i arbeids- og ' +
      'velferdsforvaltningen §§ 20 eller 20 a'
  ])('%s', (regexTester(lovnavn1)))
})

describe('lovrefs', () => {
  test.each([
    [
      'barnebortføringskonvensjonen',
      {
        lovnavn: 'barnebortføringskonvensjonen'
      }
    ]
  ])('%s', (input, expectedResult) => {
    const result = getLawRef(input)
    expect(result).toStrictEqual(expectedResult)
  })
})
*/
