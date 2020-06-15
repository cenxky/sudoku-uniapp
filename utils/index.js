export const arrayChunk = (arr, chunkSize) => {
  let results = []
  let dupArr = [...arr]

  while (dupArr.length) {
    results.push(dupArr.splice(0, chunkSize))
  }

  return results
}
