export default function documentIdToInteger (documentId) {
  // Convert document id to integer
  // remove url path, split date/id string
  // e.g.: /SF/forskrift/2018-07-02-1108 -> [2018, 07, 02, 1108]
  let date = documentId.replace(/.+\//, '').split('-')
  // Pad the ID part with zeroes
  date[date.length - 1] = date[date.length - 1].padStart(6, '0')
  date = date.join('')
  date = parseInt(date)
  return date
}
