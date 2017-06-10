# run-with-heroku-env

execute command with heroku env.

- https://github.com/shokai/run-with-heroku-env
- https://npmjs.com/package/run-with-heroku-env

[![CircleCI](https://circleci.com/gh/shokai/run-with-heroku-env.svg?style=svg)](https://circleci.com/gh/shokai/run-with-heroku-env)


## Install

    % npm i run-with-heroku-env -g


## Usage

    % run-with-heroku-env [ENV1, ENV2, ENV3] [heroku options] [execute-command]
    % run-with-heroku-env MONGOLAB_URI --app HEROKU_APP_NAME node scripts/count.js
