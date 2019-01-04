/*
  promiseFuncの実行結果をcacheObject[cacheKey]にキャッシュする
*/
export default function promiseCache(
  cacheObject,
  cacheKey,
  promiseFunc,
  flushCache = false
) {
  return new Promise((resolve, reject) => {
    if (!flushCache && cacheObject[cacheKey]) {
      if (cacheObject[cacheKey].promise) {
        cacheObject[cacheKey].promise
          .then(value => {
            resolve(value)
          })
          .catch(reason => reject(reason))
      } else {
        resolve(cacheObject[cacheKey].value)
      }
    } else {
      const promise = promiseFunc()
      cacheObject[cacheKey] = {
        promise: promise
      }
      promise
        .then(value => {
          cacheObject[cacheKey] = {
            promise: undefined,
            value: value
          }
          resolve(value)
        })
        .catch(reason => {
          cacheObject[cacheKey] = {
            promise: undefined,
            value: undefined
          }
          reject(reason)
        })
    }
  })
}
