module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  rules: {
    'no-console': 'warn',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
    // Workaround for eslint crashing on template literals.
    'template-curly-spacing': 'off',
    indent: ['error', 2, { ignoredNodes: ['TemplateLiteral'] }]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
