import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { parseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import {isURLSameOrigin} from '../helpers/url'
import cookie from '../helpers/cookie'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const { 
      data = null, 
      url, 
      method = 'get', 
      headers, 
      responseType, 
      timeout, 
      cancelToken, 
      withCredentials,
      xsrfHeaderName,
      xsrfCookieName
     } = config

    const request = new XMLHttpRequest()
    if (responseType) {
      request.responseType = responseType
    }
    if (timeout) {
      request.timeout = timeout
    }
    if (withCredentials) {
      request.withCredentials = withCredentials
    }
    request.open(method.toUpperCase(), url!, true)
    request.onreadystatechange = function handleLoad() {
      if (request.readyState !== 4) {
        return
      }
      // 处理非200的状态码情况：网络错误、超时错误
      if (request.status === 0) {
        return
      }
      const repsonseHeaders = request.getAllResponseHeaders()
      const responseData = responseType !== 'text' ? request.response : request.responseText
      const response: AxiosResponse = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: parseHeaders(repsonseHeaders),
        config,
        request
      }
      handleResponse(response)
    }

    //  网络错误处理
    request.onerror = function handleError() {
      //  没有传递response，因为onerror事件发生时，无法获取response
      reject(createError('Network Error', config, null, request))
    }

    // 超时处理
    request.ontimeout = function handleTimeout() {
      reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
    }

    // xsrf逻辑
    if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
      const xsrfValue = cookie.read(xsrfCookieName)
      if (xsrfValue && xsrfHeaderName) {
        headers[xsrfHeaderName] = xsrfValue
      }
    }

    Object.keys(headers).forEach(name => {
      if (data === null && name.toLocaleLowerCase() === 'content-type') {
        delete headers[name]
      } else {
        request.setRequestHeader(name, headers[name])
      }
    })
    if (cancelToken) {
      cancelToken.promise.then(reason => {
        request.abort()
        reject(reason)
      })
    }

    request.send(data)

    function handleResponse(response: AxiosResponse): void {
      if (response.status >= 200 && response.status < 300) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed width status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
