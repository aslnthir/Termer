export function fetchSiteConfiguration(domain: string): Promise<SiteConfiguration>
export function getSiteName(url: string): string | undefined
export function getAvalebleSites (): string[]
export const sites: string[]
export interface SiteConfiguration {
  apikeys: Record<string, string>
  sourceLanguages: string[]
  targetLanguages: string[]
  backends: string[]
  sourceRank: string[]
  backendSoruceOn: string[]
  selectSources: string[]
  deselectSources: string[]
  excludeMarkups: string[]
}
