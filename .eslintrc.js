module.exports = {
  root: true,
  extends: '@react-native',
  plugins: ['@typescript-eslint', 'react-hooks'],
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'quotes': 'off',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'off',
        'no-undef': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        'react-hooks/rules-of-hooks': 'error',
        'react-native/no-inline-styles': 0,
        'react-hooks/exhaustive-deps': 'off',
        'no-extra-boolean-cast': 'off',
        'curly': 'off',
        'eqeqeq': 'off',
        'dot-notation': 'off',
        'react/self-closing-comp': 'off',
      },
    },
  ],
};
