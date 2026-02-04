// GenAI service types - generated from genai/service.proto

export interface GenerateRequest {
  promptUuid: string
  modelId?: string
  variables: Record<string, string>
}

export interface GenerateResponse {
  generationId: string
  text: string
  metadata?: GenerationMetadata
}

export interface GenerationMetadata {
  promptTokens: number
  completionTokens: number
  costUsd: number
  durationMs: number
  model: string
}

export interface ListModelsRequest {}

export interface ListModelsResponse {
  models: Model[]
}

export interface Model {
  id: string
  provider: string
  name: string
  displayName: string
  streamingSupported: boolean
  visionSupported: boolean
  enabled: boolean
}

export interface GetHistoryRequest {
  documentUuid?: string
  limit?: number
  offset?: number
}

export interface GetHistoryResponse {
  records: GenerationRecord[]
  total: number
}

export interface GenerationRecord {
  id: string
  documentUuid: string
  model: string
  promptPreview: string
  textPreview: string
  metadata?: GenerationMetadata
  status: string
  errorMessage?: string
  createdBy: string
  createdAt: string
  completedAt?: string
}
