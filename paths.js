module.exports = {
    helpers: {
        geometry: 'server/helpers/geometry.js',
        commonFuncs: 'server/helpers/commonFunctions.js',
        tokensCalc: 'server/helpers/tokenCalculator.js',
        redisFuncs: 'server/helpers/redisFunctions.js'
    },
    controllers: {
        base: 'server/controllers/base-controller.js'
    },
    models: {
        stl: 'server/models/'
    },
    node_modules: {
        three: 'node_modules/three'
    },
    redis: {
        serverHost: '127.0.0.1',
        serverPort: 6377
    }
};