module.exports = {
    ci: {
        collect: {
            url: ['http://localhost:3000/'],
            startServerCommand: 'npm run start',
            startServerReadyPattern: "Ready in",
            startServerReadyTimeout: 60000,
            numberOfRuns: 1
        },
        assert: {
            preset: "lighthouse:recommended"
        },
        upload: {
            target: 'temporary-public-storage',
        },
        server: {}
    },
};
