export PATH := ./node_modules/.bin:$(PATH)
# :KLUDGE: Workaround for PATH extensions in Mac OS.
# :LINK: https://stackoverflow.com/a/26936855/759714
export SHELL := /bin/bash

.PHONY: config

# Open editor to modify app config.
config:
	${EDITOR} ./config/production.js

# Lint all code.
lint:
	tslint --format verbose --project ./tsconfig.json --type-check 'src/**/*.ts'

# Run the app in production mode.
start:
	NODE_ENV=production ts-node src/shipherd.ts
