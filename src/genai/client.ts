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
