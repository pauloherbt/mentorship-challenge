module.exports = {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": "./",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.ts$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/**.(controller|service|entity).(t|j)s",
      "!dist/**",
      "!**/node_modules/**",
    ],
    "coverageDirectory": "./coverage",
    "testEnvironment": "node",
  };
  