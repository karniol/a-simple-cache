module.exports = function(config) {
    config.set({
        mutator: 'typescript',
        packageManager: 'npm',
        reporters: [
            'html',
            'clear-text',
            'progress'
        ],
        testRunner: 'mocha',
        testFramework: 'mocha',
        // transpilers: ['typescript'],
        // coverageAnalysis: 'perTest',
        tsconfigFile: 'tsconfig.json',
        maxConcurrentTestRunners: 2,
        mutate: [
            'src/**/*.ts'
        ],
        mochaOptions: {
            extension: [
                'ts',
            ],
            spec: [
                'test/unit/**/*.test.ts'
            ],
            recursive: true,
            file: [],
            require: [
                'ts-node/register',
                'source-map-support/register',
            ],
            ui: 'bdd',
        }
    });
};
