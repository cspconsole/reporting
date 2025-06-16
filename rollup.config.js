import typescript from 'rollup-plugin-typescript2';
import copy from 'rollup-plugin-copy';

export default [
    {
        input: 'src/indexUmd.ts',  // UMD entry file
        output: [
            {
                file: 'dist/index.umd.js',
                format: 'umd',
                name: 'cspConsoleReporting',
                sourcemap: true,
            },
        ],
        context: 'window',
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',  // Use the TypeScript config
                clean: true,
            }),
            copy({
                targets: [
                    { src: 'src/service-worker.js', dest: 'dist' },  // Copy service-worker.js
                ],
            }),
        ],
    },
    {
        input: 'src/indexEsm.ts',  // ESM entry file
        output: [
            {
                file: 'dist/index.esm.js',
                format: 'esm',
                sourcemap: true,
            },
        ],
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                clean: true,
            }),
            copy({
                targets: [
                    { src: 'src/service-worker.js', dest: 'dist' },
                ],
            }),
        ],
    },
];
