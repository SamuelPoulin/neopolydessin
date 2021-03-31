/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = (config) => {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-electron'),
      require('karma-jasmine-html-reporter'),
      require('karma-spec-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      useIframe: false
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage'),
      reports: ['html', 'text', 'lcov'],
      fixWebpackSourcePaths: true,
      combineBrowserReports: true,
    },
    reporters: ['spec', 'kjhtml'],
    port: 9876,
    colors: true,
    browserNoActivityTimeout: 10000,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    singleRun: true,
    browsers: ['Electron'],
    preprocessors: {
      '**/*.js': ['electron']
    },
  });
};
