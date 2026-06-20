const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so Metro can resolve packages from root node_modules
config.watchFolders = [monorepoRoot];

// Resolve modules from mobile app first, then the monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

// Hard-intercept 'react' resolution so that react-native (hoisted at root) always
// gets react@19 from the mobile app's node_modules, not react@18 from the root.
const react19Dir = path.resolve(projectRoot, "node_modules/react");
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "react") {
    return { filePath: path.join(react19Dir, "index.js"), type: "sourceFile" };
  }
  if (moduleName === "react/jsx-runtime") {
    return { filePath: path.join(react19Dir, "jsx-runtime.js"), type: "sourceFile" };
  }
  if (moduleName === "react/jsx-dev-runtime") {
    return { filePath: path.join(react19Dir, "jsx-dev-runtime.js"), type: "sourceFile" };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
