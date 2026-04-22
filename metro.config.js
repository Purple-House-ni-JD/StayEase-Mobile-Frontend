const { getDefaultConfig } = require("expo/metro-config");

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { resolver, transformer } = config;

  resolver.assetExts = resolver.assetExts.filter((ext) => ext !== "svg");
  resolver.sourceExts.unshift("svg");

  transformer.babelTransformerPath =
    require.resolve("react-native-svg-transformer");

  return config;
})();
