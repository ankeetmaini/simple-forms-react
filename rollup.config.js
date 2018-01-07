const babel = require('rollup-plugin-babel');
const NAME = 'simple-forms-react';
const globals = {
    react: 'React'
};
export default {
    input: './index.js',
    plugins: [babel({ exclude: 'node_modules/**' })],
    output: [
        { file: `./dist/${NAME}.cjs.js`, format: 'cjs', sourcemap: true, globals },
        { file: `./dist/${NAME}.esm.js`, format: 'es', sourcemap: true, globals },
        {
            file: `./dist/${NAME}.js`,
            format: 'umd',
            name: 'SimpleFormsReact',
            sourcemap: true,
            globals
        }
    ],
    external: ['react']
};
