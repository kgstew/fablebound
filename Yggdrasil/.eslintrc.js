module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    ignorePatterns: ['.eslintrc.js'],
    root: true,
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
    },
    plugins: ['@typescript-eslint'],
    rules: {
        '@typescript-eslint/no-explicit-any': 'off',
    },
}
