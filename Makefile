test:
	./node_modules/.bin/mocha test/**/*

coverage:
	istanbul cover ./node_modules/.bin/_mocha -- -R spec test/**/*

codeclimate:
	istanbul cover ./node_modules/.bin/_mocha --report lcovonly -- -R spec && ./node_modules/.bin/codeclimate < ./coverage/lcov.info

.PHONY: test
