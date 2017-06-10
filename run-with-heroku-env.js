#!/usr/bin/env node
const {execSync, spawn} = require('child_process')
const parseArgv = require('./parse-argv')

function getHerokuEnvs ({envs, herokuOptions} = {}) {
  const option =
        Object.keys(herokuOptions)
        .map(key => `--${key} ${herokuOptions[key]}`)
        .join(' ')

  const cmd = `heroku config ${option}`
  console.error(`== getting ENV ${envs}: ${cmd}`)

  const herokuEnvs = {}
  for (let line of execSync(cmd).toString().split(/\n/)) {
    const [, key, value] = line.match(/^([A-Z\d_]+):\s+([^\s]+)$/) || []
    if (key && value && envs.includes(key)) {
      herokuEnvs[key] = value
    }
  }
  return herokuEnvs
}

function exec ({herokuEnvs, command}) {
  console.error(`== run: ${command.join(' ')}`)
  const _spawn = spawn(command[0], command.slice(1), {
    stdio: ['pipe', process.stdout, process.stderr],
    env: Object.assign({}, process.env, herokuEnvs)
  })
  _spawn.on('close', process.exit)
  _spawn.on('error', console.error)
}

function run () {
  const {envs, herokuOptions, command} = parseArgv(process.argv.slice(2))
  const herokuEnvs = getHerokuEnvs({envs, herokuOptions})
  exec({herokuEnvs, command})
}

run()
