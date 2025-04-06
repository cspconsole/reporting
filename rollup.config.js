import typescript from 'rollup-plugin-typescript2';

export default [
    {
        input: 'src/indexUmd.ts', // The entry file
        output: [
            {
                file: 'src/demo/dist/index.umd.js', // UMD bundle for the browser
                format: 'umd',
                name: 'cspConsoleReporting', // Global variable name for the browser
                sourcemap: true,
            },
        ],
        context: 'window',
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }), // Use TypeScript config
        ],
    },
    {
        input: 'src/indexEsm.ts', // The entry file
        output: [
            {
                file: 'src/demo/dist/index.esm.js', // ESM bundle for Webpack, Vite, etc.
                format: 'esm',
                sourcemap: true,
            },
        ],
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }), // Use TypeScript config
        ],
    }
];
