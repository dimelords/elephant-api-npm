import tseslint from 'typescript-eslint'
import elephant from '../../eslint.config.base.mjs'

export default [
  ...elephant,
  {
    files: ['tsdown.config.ts'],
    ...tseslint.configs.disableTypeChecked
  }
]
