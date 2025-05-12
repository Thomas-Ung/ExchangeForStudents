module.exports = function(api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        '@babel/plugin-transform-export-namespace-from',
<<<<<<< HEAD
        //
        /* ['module:react-native-dotenv', {
=======
        // Comment out or remove this plugin:
        /*
        ['module:react-native-dotenv', {
>>>>>>> origin/Thomas-AI
          moduleName: '@env',
          path: '.env',
          blacklist: null,
          whitelist: null,
          safe: false,
          allowUndefined: true
        }],
        */
<<<<<<< HEAD
       // Other plugins...
=======
        // Other plugins...
>>>>>>> origin/Thomas-AI
      ]
    };
  };