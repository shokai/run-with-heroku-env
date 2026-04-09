#!/usr/bin/env node

const pkg = require('./package.json');
const { execFileSync, spawn } = require('child_process');
const parseArgv = require('./parse-argv');

function getHerokuEnvs({ envs, herokuOptions } = {}) {
  const args = ['config', '--json'];
  for (const key of Object.keys(herokuOptions)) {
    args.push(`--${key}`);
    if (herokuOptions[key] !== true) {
      args.push(String(herokuOptions[key]));
    }
  }

  console.error(`== getting ENV ${envs}: heroku ${args.join(' ')}`);

  const result = execFileSync('heroku', args);
  const output = result.toString();
  let config;
  try {
    config = JSON.parse(output);
  } catch (e) {
    console.error(output);
    process.exit(1);
  }

  const herokuEnvs = {};
  for (const key of envs) {
    if (config[key] !== undefined) {
      herokuEnvs[key] = config[key];
    }
  }
  return herokuEnvs;
}

function exec({ herokuEnvs, command }) {
  console.error(`== run: ${command.join(' ')}`);
  const _spawn = spawn(command[0], command.slice(1), {
    stdio: ['pipe', process.stdout, process.stderr],
    env: Object.assign({}, process.env, herokuEnvs)
  });
  _spawn.on('close', process.exit);
  _spawn.on('error', console.error);
}

function help() {
  return `
run-with-heroku-env v${pkg.version}
Usage:
  % run-with-heroku-env [ENV1 ENV2 ENV3] [heroku options] [execute-command]
  % run-with-heroku-env MONGOLAB_URI --app HEROKU_APP_NAME node scripts/count.js
`;
}

function run() {
  const { envs, herokuOptions, command } = parseArgv(process.argv.slice(2));
  if (envs.length < 1) {
    console.error(`Argument Error: ENV is missing`);
    console.error(help());
    process.exit(1);
  }
  const herokuEnvs = getHerokuEnvs({ envs, herokuOptions });
  for (let key of envs) {
    if (!herokuEnvs[key]) {
      console.error(`${key} is not found at Heroku ENV`);
      process.exit(1);
    }
  }
  exec({ herokuEnvs, command });
}

run();
