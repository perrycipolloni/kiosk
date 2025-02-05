import camelCase from 'lodash/camelCase'

const moduleCache = {}
const root = { modules: {} }
;(function updateModules () {
  // Allow us to dynamically require all Vuex module files.
  // https://webpack.js.org/guides/dependency-management/#require-context
  const requireModule = require.context(
    // Search for files in the current directory.
    '.',
    // Search for files in subdirectories.
    true,
    // Include any .js files that are not this file or a unit test.
    /^((?!index|\.unit\.).)*\.js$/
  )

  // For every Vuex module...
  requireModule.keys().forEach((fileName) => {
    const moduleDefinition = requireModule(fileName)

    // Skip the module during hot reload if it refers to the
    // same module definition as the one we have cached.
    if (moduleCache[fileName] === moduleDefinition) return

    // Update the module cache, for efficient hot reloading.
    moduleCache[fileName] = moduleDefinition

    // Get the module path as an array.
    const modulePath = fileName
      // Remove the "./" from the beginning.
      .replace(/^\.\//, '')
      // Remove the file extension from the end.
      .replace(/\.\w+$/, '')
      // Split nested modules into an array path.
      .split(/\//)
      // camelCase all module namespaces and names.
      .map(camelCase)

    // Get the modules object for the current path.
    const { modules } = getNamespace(root, modulePath)

    // Add the module to our modules object.
    modules[modulePath.pop()] = {
      // Modules are namespaced by default.
      namespaced: true,
      ...moduleDefinition
    }
  })
})()

// Recursively get the namespace of a Vuex module, even if nested.
function getNamespace (subtree, path) {
  if (path.length === 1) return subtree

  const namespace = path.shift()
  subtree.modules[namespace] = {
    modules: {},
    ...subtree.modules[namespace]
  }
  return getNamespace(subtree.modules[namespace], path)
}

export default root.modules
