# gaddag
A typescript implementation of the GADDAG data structure

## Setup/Install

Install the yarn package manager
* Install harp globally: `yarn global add harp` or `npm install -g harp`
* Run `yarn install`

## Commands

NPM scripts alias gulp commands for building and running the project and sample application.  Use either `yarn run <command>` or `npm run <command>`:

* Build `yarn run deploy`
* Run harp server `harp server .`
* Run and build `yarn run start`
* Run unit tests `yarn run test`
* Continuously run tests on change `yarn run watch-test`
* Continuously run deploy `yarn run watch-deploy`

By default harp will automatically detect file changes from the deploy step.

## Sample application

The sample application is part of a larger project for analyzing valid words using the English Open Word List. The fifth slide of the presentation shows a D3.js driven visualiztion of a GADDAG along with a number of controls for performing various queries to the GADDAG.