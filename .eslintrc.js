// module.exports = {
//     root: true,
//     parser: '@typescript-eslint/parser',
//     plugins: [
//       '@typescript-eslint',
// 	//   'import-newlines',
//     ],
//     extends: [
//       'eslint:recommended',
//       'plugin:@typescript-eslint/eslint-recommended',
//       'plugin:@typescript-eslint/recommended',
//     ],
// 	rules: {
//         // 'semi': ['error', 'always'],
// 		// 'indent': ['error', 'tab'],
// 		// 'import-newlines/enforce': ['error', 4, 120],
//     },
// };
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
	  'prettier',
	//   'import-newlines',
    ],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/eslint-recommended',
      'plugin:@typescript-eslint/recommended',
	  'prettier',
    ],
	rules: {
    	'prettier/prettier': ['error'],
        // 'semi': ['error', 'always'],
		// 'indent': ['error', 'tab'],
		// 'import-newlines/enforce': ['error', 4, 120],
    },
};