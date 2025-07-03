
import vue from 'eslint-plugin-vue'
import airbnb from 'eslint-config-airbnb-base'

export default [
  {
    files: ['**/*.js', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: {
      vue,
    },
    rules: {
      ...airbnb.rules,
      ...vue.configs['vue3-essential'].rules,
      'no-console': 'warn',
      'vue/multi-word-component-names': 'off',
    },
  },
]