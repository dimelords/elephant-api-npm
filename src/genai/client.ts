// GenAI service client - Twirp RPC client

import type {
  GenerateRequest,
  GenerateResponse,
  ListModelsRequest,
  ListModelsResponse,
  GetHistoryRequest,
  GetHistoryResponse
} from './types'

export class GenAIClient {
  private baseUrl: string
  private headers: Record<string, string>

  constructor(baseUrl: string, headers?: Record<string, string>) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.headers = headers || {}
  }

  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    return this.call('Generate', request)
  }

  async *generateStream(request: GenerateRequest): AsyncGenerator<string, void, unknown> {
    const url = `${this.baseUrl}/stream/generate`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        buffer += decoder.decode(value, { stream: true })

        // Process complete SSE messages
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || '' // Keep incomplete message in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue

          const data = line.slice(6) // Remove 'data: ' prefix

          if (data === '[DONE]') {
            return
          }

          try {
            const parsed = JSON.parse(data)
            if (parsed.error) {
              throw new Error(parsed.error)
            }
            if (parsed.text) {
              yield parsed.text
            }
          } catch (e) {
            console.warn('Failed to parse SSE data:', data, e)
          }
        }
      }
    } finally {
      reader.releaseLock()
    }
  }

  async listModels(request: ListModelsRequest = {}): Promise<ListModelsResponse> {
    return this.call('ListModels', request)
  }

  async getHistory(request: GetHistoryRequest): Promise<GetHistoryResponse> {
    return this.call('GetHistory', request)
  }

  private async call<TRequest, TResponse>(
    method: string,
    request: TRequest
  ): Promise<TResponse> {
    const url = `${this.baseUrl}/twirp/elephant.genai.GenAI/${method}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      body: JSON.stringify(request)
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        code: 'internal',
        msg: `HTTP ${response.status}: ${response.statusText}`
      }))

      throw new Error(`Twirp error ${error.code}: ${error.msg}`)
    }

    return response.json()
  }

  withHeaders(headers: Record<string, string>): GenAIClient {
    return new GenAIClient(this.baseUrl, { ...this.headers, ...headers })
  }
}
