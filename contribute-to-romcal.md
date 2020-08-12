# Install, Build, Run and Test romcal locally

This section describes how get and run the romcal sourcecode in your machine, and how to contribute to this project.
You might also be interested in reading the general [contribution guide](../CONTRIBUTING.md).

- [Retrieve the codebase](#retrieve-the-codebase)
- [Install](#install)
- [build](#build)
- [Run](#run)
- [Test](#test)
- [Coverage reporting](#coverage-reporting)

## Retrieve the codebase

1. [Fork the repo](https://help.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository).

2. Clone your forked repo (Replace `github-username` by your GitHub username):

```bash
# Using SSH URL
git clone git@github.com:github-username/romcal.git

# Using HTTPS URL
git clone https://github.com/github-username/romcal.git
```

3. By default your cloned repo is referenced as `origin`. It corresponds to your forked romcal repository.
   Then it's recommended to add a reference to the original romcal repository. This will allow you to get the latest code change and update your forked repo from the original romcal repo.
   It's recommended to call this new reference: `upstream`. You can do it by the following command:

```bash
# Using SSH URL
git remote add upstream git@github.com:romcal/romcal.git

# Using HTTPS URL
git remote add upstream https://github.com/romcal/romcal.git
```

For a more complete guide, have a look to this [wiki page](https://github.com/romcal/romcal/wiki/Contributor%E2%80%99s-guide).
You will also find a lot of information on how to use `git` and GitHub over the internet.

## Install

When you have just cloned romcal, and every time you have fetched or rebased the latest code change, you have to install the romcal dependencies:

```
npm install
```

## Build

The romcal codebase is actually the same for backend and frontend usage.
But when romcal is built, two packages are generated in the `/dist` folder.
To make it working on the frontend side, the frontend library is wrapped and built thanks to `webpack`.

Build the project each time you are getting fresh code or updating the codebase:

```bash
npm run build
```

## Run

Instead of building everytime the codebase to test your code, you might be interested to run directly the TypeScript codebase and test it in the Node.js ecosystem.

```javascript
// sample-test-file.ts in the parent directory of romcal (outside the codebase)
import romcal from './romcal/src';

(async () => {
  const dates = await romcal.calendarFor({
    country: 'france',
    year: 2020,
    locale: 'fr',
  });

  console.log(dates);
})();
```

You can call your `sample-test-file.ts` directly from the bash (e.g. in the romcal directory):

```bash
node -r ts-node/register -r tsconfig-paths/register ../sample-test-file.ts
```

## Test

romcal code is unit tested using the [jest](https://jestjs.io/) framework.

:heavy_check_mark: [TravisCI](https://travis-ci.org/romcal/romcal) automates test runs to ensure that romcal's functionality is working as expected.

[`package.json`](../package.json#L21) exposes test scripts:

- For running all test suites in a single run:

```bash
npm test
```

- For running all test suites and then watch the source directory for changes:

```bash
npm run test:watch
```

- For testing a single file during development,

```bash
npm run test -t ./src/utils/object.test.ts
```

_pass the `-t` flag and the path of the file_

## Coverage reporting

A coverage report is generated for every core branch build and published to [gh-pages]().
