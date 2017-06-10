#!/usr/bin/env node
const childProcess = require('child_process')
const parseArgv = require('./parse-argv')

function getHerokuEnvs ({envs, herokuOptions} = {}) {
  const option =
        Object.keys(herokuOptions)
        .map(key => `--${key} ${herokuOptions[key]}`)
        .join(' ')

  const cmd = `heroku config ${option}`
  console.error(`== getting ENV ${envs}: ${cmd}`)

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
  console.error(`== run: ${command}`)
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
