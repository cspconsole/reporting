import typescript from 'rollup-plugin-typescript2';

export default {
    input: 'src/index.ts', // The entry file
    output: [
        {
            file: 'src/demo/dist/index.umd.js', // UMD bundle for the browser
            format: 'umd',
            name: 'MyPackage', // Global variable name for the browser
            sourcemap: true,
        },
        {
            file: 'src/demo/dist/index.esm.js', // ESM bundle for Webpack, Vite, etc.
            format: 'esm',
            sourcemap: true,
        },
    ],
    plugins: [
        typescript({ tsconfig: './tsconfig.json' }), // Use TypeScript config
    ],
};
