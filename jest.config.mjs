export default {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/jest.setup.js'],
    transform: {
        "^.+\\.js$": "babel-jest"
    },
};
