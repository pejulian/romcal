#!/bin/bash
set -ex

TRAVIS_BRANCH=$1
TRAVIS_EVENT_TYPE=$2
NPM_EMAIL=$3
NPM_API_TOKEN=$4

# Bump version only if TRAVIS_EVENT_TYPE is push
if [ $TRAVIS_EVENT_TYPE == 'push' ]
then

    PACKAGE_NAME="$(node -pe "require('./package.json')['name']")"
    echo "PACKAGE_NAME is ${PACKAGE_NAME}"

    CURRENT_VERSION="$(npm view ${PACKAGE_NAME}@latest version)"
    echo "CURRENT_VERSION is $CURRENT_VERSION"

    # If not on master branch ...
    if [ $TRAVIS_BRANCH != 'master' ]; then

        # ... obtain and tokenize the latest version according to tag
        if [ $TRAVIS_BRANCH == 'test' ]; then
            LATEST_TAG_VERSION="$(npm view ${PACKAGE_NAME}@beta version)"
        elif [ $TRAVIS_BRANCH == 'dev' ]; then
            LATEST_TAG_VERSION="$(npm view ${PACKAGE_NAME}@alpha version)"
        else
            LATEST_TAG_VERSION="$(npm view ${PACKAGE_NAME}@unstable version)"
        fi

        IFS='-' tokens=( $LATEST_TAG_VERSION )
        SEMVER=$tokens[0];
        PREID=$tokens[1];
        echo "the latest tag SEMVER is ${SEMVER} with a PREID of ${PREID}"

        # If tag version is higher than the 'latest' version in npm
        # then it means that no new version has been published to master yet and
        # we shuld continue incrementing the preid based on the tag version
        if [ $SEMVER -gt $CURRENT_VERSION ]
        then
            CURRENT_VERSION = LATEST_TAG_VERSION
        fi

    fi

    # Bump version accordingly
    if [ $TRAVIS_BRANCH == 'master' ]; then
        NEW_VERSION="$(./node_modules/.bin/semver -i patch ${CURRENT_VERSION} )"
    elif [ $TRAVIS_BRANCH == 'test' ]; then
        NEW_VERSION="$(./node_modules/.bin/semver -i prerelease --preid beta $CURRENT_VERSION)"
    elif [ $TRAVIS_BRANCH == 'dev' ]; then
        NEW_VERSION="$(./node_modules/.bin/semver -i prerelease --preid alpha $CURRENT_VERSION )"
    else
        NEW_VERSION="$(./node_modules/.bin/semver -i prerelease --preid unstable $CURRENT_VERSION )"
    fi

    echo "NEW_VERSION is ${NEW_VERSION}"

    npm version "${NEW_VERSION}" -m "[skip travis-ci] Release version %s"
    git push origin ${TRAVIS_BRANCH}

fi