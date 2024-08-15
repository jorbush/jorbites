module.exports = {
    ci: {
        collect: {
            url: ['http://localhost:3000/'],
            startServerCommand: 'npm run start',
            startServerReadyPattern: "ready on",
            numberOfRuns: 1,
            settings: {
                preset: "desktop"
            }
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
