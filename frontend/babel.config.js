module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        '@babel/plugin-transform-export-namespace-from',
        // Comment out or remove this plugin:
        /*
        ['module:react-native-dotenv', {
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true
        }],
        */
        // Other plugins...
      ]
    };
  };