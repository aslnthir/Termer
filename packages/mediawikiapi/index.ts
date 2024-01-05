interface Options {
  url: string
  origin: string
}

export interface PageTitle {
  title: string
}

const defaultOptions: Options = {
  url: 'https://en.wikipedia.org/w/api.php',
  origin: '*'
}

export default class WikiAPI {
  private options: Options = defaultOptions

  constructor(options: Partial<Options> = defaultOptions) {
    Object.assign(this.options, options)
  }

  public listAllPages(): AsyncIterableIterator<Array<PageTitle>> {
    function postprocess(result: AllPagesResult): Array<PageTitle> {
      return result.allpages
    }
    return aggregate(
      this.options,
      { list: 'allpages', aplimit: '500' },
      postprocess
    )
  }

  public listBrokenRedirects(): AsyncIterableIterator<Array<PageTitle>> {
    function postprocess(result: QueryPageResult): Array<PageTitle> {
      return Object.values(result.pages)
    }
    return aggregate(
      this.options,
      {
        generator: 'querypage',
        gqppage: 'BrokenRedirects',
        gqplimit: '500'
      },
      postprocess
    )
  }

  public async getPageExtract(title: string): Promise<Page> {
    const result = await api<PageExtractResult>(this.options, {
      titles: title,
      prop: 'extracts',
      exintro: 'true',
      redirects: 'true'
    })
    return Object.values(result.query.pages)[0]
  }
}

interface PageExtractResult {
  pages: Pages
}

interface AllPagesResult {
  allpages: Array<PageTitle>
}

interface QueryPageResult {
  pages: {
    [key: string]: PageTitle
  }
}

async function* aggregate<T, Y>(
  options: Options,
  params: OptionalQueryParams,
  postprocess: (result: T) => Y
): AsyncIterableIterator<Y> {
  const result = await api<T>(options, params)
  if (!result.query) return
  const arr = postprocess(result.query)
  if (!arr) return
  yield arr
  if (result.continue) {
    Object.assign(params, result.continue)
    yield* aggregate(options, params, postprocess)
  }
}

interface Pages {
  [key: number]: Page
}
export interface Page {
  extract: string
  title: string
  pageid: number
}

interface AllPagesQuery {
  list: 'allpages'
  aplimit: '500'
}
interface ExtractsQuery {
  prop: 'extracts'
  titles: string
  exintro: 'true'
  redirects: 'true'
}
interface BrokenRedirectsQuery {
  generator: 'querypage'
  gqppage: 'BrokenRedirects'
  gqplimit: '500'
}
type OptionalQueryParams = AllPagesQuery | ExtractsQuery | BrokenRedirectsQuery

interface RequiredQueryParams {
  format: 'json'
  action: 'query'
  origin: string
  maxage: number
  smaxage: number
}

type QueryParams = RequiredQueryParams & OptionalQueryParams

interface APIResponse<T> {
  continue?: object
  error?: {
    info: string
  }
  query: T
}

async function api<T>(
  options: Options,
  params: OptionalQueryParams
): Promise<APIResponse<T>> {
  const defaultParams: RequiredQueryParams = {
    format: 'json',
    action: 'query',
    origin: options.origin,
    maxage: 600,
    smaxage: 600
  }
  const queryParams: QueryParams = Object.assign({}, defaultParams, params)
  const queryString = Object.entries(queryParams).reduce(
    (acc, [key, value]) => {
      if (key && value) return `${acc}${key}=${value}&`
      else return acc
    },
    '?'
  )
  const url = `${options.url}${queryString}`
  const result = ((await fetch(url)).json() as unknown) as APIResponse<T>
  if (result.error) {
    throw new Error(result.error.info)
  }
  return result
}
