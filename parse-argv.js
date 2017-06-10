function isEnv (arg) {
  return /^[A-Z\d_]+$/.test(arg)
}

function isArgvKey (arg) {
  return /^-+[^-]/.test(arg)
}

function isArgvValue (arg) {
  return !isArgvKey(arg)
}

function parseArgvKey (arg) {
  return arg.replace(/^-+/, '')
}

module.exports = function parseArgv (argv) {
  const envs = []
  while (isEnv(argv[0])) {
    envs.push(argv.shift())
  }

  const herokuOptions = {}
  while (isArgvKey(argv[0])) {
    const key = parseArgvKey(argv.shift())
    const value = isArgvValue(argv[0]) ? argv.shift() : true
    herokuOptions[key] = value
  }

  const command = argv
  return {envs, herokuOptions, command}
}
