export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  if (error instanceof Error) {
    // 网络错误
    if (error.name === 'NetworkError' || error.message.includes('network')) {
      return new AppError(
        '网络连接错误，请检查网络后重试',
        ErrorCodes.NETWORK_ERROR,
        503
      )
    }

    // API 错误
    if (error.message.includes('API')) {
      return new AppError(
        'API 服务暂时不可用，请稍后重试',
        ErrorCodes.API_ERROR,
        502
      )
    }

    // 其他已知错误
    return new AppError(
      error.message,
      ErrorCodes.UNKNOWN_ERROR,
      500,
      { originalError: error }
    )
  }

  // 未知错误
  return new AppError(
    '发生未知错误，请重试',
    ErrorCodes.UNKNOWN_ERROR,
    500,
    { originalError: error }
  )
}

export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message
  }

  if (error instanceof Error) {
    // 处理常见错误类型
    if (error.message.includes('timeout')) {
      return '请求超时，请重试'
    }
    if (error.message.includes('network')) {
      return '网络连接错误，请检查网络后重试'
    }
    return error.message
  }

  return '发生未知错误，请重试'
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === maxRetries) {
        throw lastError
      }

      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt))
    }
  }

  // 这行代码永远不会执行，但 TypeScript 需要它
  throw lastError
} 