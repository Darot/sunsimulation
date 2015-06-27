module.exports = function(config) {
  config.set({
    frameworks: ['jasmine'],
 
    files: [
        'test/*.js',
        'node_modules/suncalc/suncalc.js'
    ]
  });
};
