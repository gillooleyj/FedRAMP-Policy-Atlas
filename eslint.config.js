import js from '@eslint/js';
import ts from 'typescript-eslint';
export default ts.config({ignores:['dist/**','node_modules/**','public/**']},js.configs.recommended,...ts.configs.recommended,{files:['**/*.{js,mjs,ts,tsx}'],languageOptions:{globals:{structuredClone:'readonly',console:'readonly',process:'readonly',Buffer:'readonly',URL:'readonly',document:'readonly',window:'readonly',fetch:'readonly',setTimeout:'readonly',requestAnimationFrame:'readonly',cancelAnimationFrame:'readonly'}}});
