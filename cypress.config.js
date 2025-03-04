const { defineConfig } = require('cypress')

module.exports = defineConfig({
  video: true,
  fixturesFolder: '.cypress/fixtures',
  screenshotsFolder: '.cypress/screenshots',
  videosFolder: '.cypress/videos',
  viewportWidth: 1000,
  viewportHeight: 1600,
  requestTimeout: 60000,
  responseTimeout: 60000,
  defaultCommandTimeout: 60000,
  pageLoadTimeout: 90000,
  retries: {
    runMode: 2,
    openMode: 2,
  },
  env: {
    opensearch: 'localhost:9200',
    opensearchDashboards: 'localhost:5601',
    security_enabled: false,
  },
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./.cypress/plugins/index.js')(on, config)
    },
    specPattern: [
      '.cypress/integration/email_senders_and_groups.spec.js',
      '.cypress/integration/channels.spec.js',
    ],
    supportFile: '.cypress/support/index.js',
  },
})
