#!/bin/bash

npm run lint

mup setup --config=.deploy/mup.staging.js

mup deploy --config=.deploy/mup.staging.js --settings=.deploy/settings.json