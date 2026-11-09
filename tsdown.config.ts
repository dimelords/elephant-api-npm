import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    'repository/index': './src/repository/index.ts',
    'repositorysocket/index': './src/repositorysocket/index.ts',
    'newsdoc/newsdoc': './src/newsdoc/newsdoc.ts',
    'index/index': './src/index/index.ts',
    'spell/index': './src/spell/index.ts',
    'user/index': './src/user/index.ts',
    'replicant/index': './src/replicant/index.ts',
    // Dimelords-only: GenAI service client (not in upstream)
    'genai/index': './src/genai/index.ts'
  },
  outDir: './dist',
  format: ['cjs', 'esm'],
  dts: true,
  logLevel: 'warn'
})
