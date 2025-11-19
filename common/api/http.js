// 统一请求封装（H5 下基于 uni.request）
const defaultConfig = {
  baseURL: '', // 可在此填入后端地址，如 http://localhost:3000/api
  timeout: 10000
}

export function setBaseURL(url) {
  defaultConfig.baseURL = url || ''
}

function buildURL(url) {
  if (!defaultConfig.baseURL) return url
  if (url.startsWith('http')) return url
  const sep = defaultConfig.baseURL.endsWith('/') ? '' : '/'
  return defaultConfig.baseURL + sep + url.replace(/^\//,'')
}

export function request({ url, method = 'GET', data = {}, header = {} }) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: buildURL(url),
      method,
      data,
      timeout: defaultConfig.timeout,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      success: (res) => {
        const { statusCode, data } = res
        if (statusCode >= 200 && statusCode < 300) {
          resolve(data)
        } else {
          reject(new Error(data?.message || `HTTP ${statusCode}`))
        }
      },
      fail: (err) => reject(err)
    })
  })
}

export default {
  setBaseURL,
  request
}
