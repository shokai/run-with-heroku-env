#!/usr/bin/env node
const childProcess = require('child_process')

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

function parseArgv (argv) {
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

  const command = argv.join(' ')
  return {envs, herokuOptions, command}
}

function getHerokuEnvs ({envs, herokuOptions} = {}) {
  let cmd = 'heroku config'
  for (let key of Object.keys(herokuOptions)) {
    cmd += ` --${key} ${herokuOptions[key]}`
  }

  const herokuEnvs = {}

  for (let line of childProcess.execSync(cmd).toString().split(/\n/)) {
    const [, key, value] = line.match(/^([A-Z\d_]+):\s+([^\s]+)$/) || []
    if (key && value && envs.includes(key)) {
      herokuEnvs[key] = value
    }
  }
  return herokuEnvs
}

function exec ({herokuEnvs, command}) {
  let cmd = command
  for (let key of Object.keys(herokuEnvs)) {
    cmd = `${key}=${herokuEnvs[key]} ${cmd}`
  }
  return childProcess.execSync(cmd).toString()
}

function run () {
  const {envs, herokuOptions, command} = parseArgv(process.argv.slice(2))
  const herokuEnvs = getHerokuEnvs({envs, herokuOptions})
  console.log(exec({herokuEnvs, command}))
}

run()
