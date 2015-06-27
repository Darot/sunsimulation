module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
 
    files: [
        'test/*.js',
        'js/SunPositionCalc.js',
        'node_modules/suncalc/suncalc.js'
    ]
  });
};
