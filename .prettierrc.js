module.exports = {
    trailingComma: "all",
    bracketSpacing: true,
    tabWidth: 4,
    semi: false,
    singleQuote: true,
    overrides: [
        {
          files: "*.md",
          options: {
            tabWidth: 1,
            printWidth: 80,
            proseWrap: 'always',
          }
        }
      ]
  }