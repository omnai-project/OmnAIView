module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  tabWidth: 2,
  endOfLine: 'auto',

  overrides: [
    {
      files: '*.html',
      options: { parser: 'angular' },
    },
  ],
};
