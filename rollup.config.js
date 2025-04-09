import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';

export default [
    {
        input: 'src/indexUmd.ts', // The entry file
        output: [
            {
                file: 'dist/index.umd.js', // UMD bundle for the browser
                format: 'umd',
                name: 'cspConsoleReporting', // Global variable name for the browser
                sourcemap: true,
            },
        ],
        context: 'window',
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }), // Use TypeScript config
            copy({
                targets: [
                    { src: 'src/service-worker.js', dest: 'dist' } // Copy service-worker.js to dist folder
                ],
            }),
        ],
    },
    {
        input: 'src/indexEsm.ts', // The entry file
        output: [
            {
                file: 'dist/index.esm.js', // ESM bundle for Webpack, Vite, etc.
                format: 'esm',
                sourcemap: true,
            },
        ],
        plugins: [
            typescript({ tsconfig: './tsconfig.json' }), // Use TypeScript config
            copy({
                targets: [
                    { src: 'src/service-worker.js', dest: 'dist' } // Copy service-worker.js to dist folder
                ],
            }),
        ],
    }
];
