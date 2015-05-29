.PHONY: test build coverage codeclimate check-if-built jshint

test:
	./node_modules/.bin/mocha test/*

coverage:
	istanbul cover ./node_modules/.bin/_mocha -- -R spec test/**/*

codeclimate:
	istanbul cover ./node_modules/.bin/_mocha --report lcovonly -- -R spec && ./node_modules/.bin/codeclimate < ./coverage/lcov.info

build:
	mkdir -p dist/
	./node_modules/.bin/browserify -r ./lib/index.js:flux-crud-store -x immutable -x underscore -x backbone > dist/bundle.js
	cat build/umd-head.js dist/bundle.js build/umd-tail.js > dist/flux_crud_store.js
	rm dist/bundle.js

check-if-built:
	make build
	test `git diff --name-only dist/flux_crud_store.js | wc -l` -eq 0

jshint:
	jshint . --exclude-path .jshintignore

jscs:
	jscs .
