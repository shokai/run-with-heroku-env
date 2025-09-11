#!/usr/bin/env node

const pkg = require('./package.json')
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
    const [, key, value] = line.match(/^([A-Z\d_]+):\s+(.+)$/) || []
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

function help () {
  return `
run-with-heroku-env v${pkg.version}
Usage:
  % run-with-heroku-env [ENV1 ENV2 ENV3] [heroku options] [execute-command]
  % run-with-heroku-env MONGOLAB_URI --app HEROKU_APP_NAME node scripts/count.js
`
}

function run () {
  const {envs, herokuOptions, command} = parseArgv(process.argv.slice(2))
  if (envs.length < 1) {
    console.error(`Argument Error: ENV is missing`)
    console.error(help())
    process.exit(1)
  }
  const herokuEnvs = getHerokuEnvs({envs, herokuOptions})
  for (let key of envs) {
    if (!herokuEnvs[key]) {
      console.error(`${key} is not found at Heroku ENV`)
      process.exit(1)
    }
  }
  exec({herokuEnvs, command})
}

run()
