const { getDefaultConfig } = require("expo/metro-config");
const { withReanimated } = require("react-native-reanimated/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = withReanimated(config);
