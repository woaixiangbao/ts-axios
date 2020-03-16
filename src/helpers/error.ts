import { AxiosRequestConfig, AxiosResponse } from '../types'
export class AxiosError extends Error {
  isAxiosError: Boolean
  config: AxiosRequestConfig
  code?: string | null
  request?: any
  response?: AxiosResponse

  constructor(
    message: string,
    config: AxiosRequestConfig,
    code?: string | null,
    request?: any,
    response?: AxiosResponse
  ) {
    super(message)
    this.config = config
    this.code = code
    this.request = request
    this.response = response
    this.isAxiosError = true

    // 用于处理TS的bug，在继承原始类例如Error时，无法获取方法的bug
    Object.setPrototypeOf(this, AxiosError.prototype)
  }
}

// 定义工厂函数
export function createError(
  message: string,
  config: AxiosRequestConfig,
  code?: string | null,
  request?: any,
  response?: AxiosResponse
) {
  const error = new AxiosError(message, config, code, request, response)
  return error
}
