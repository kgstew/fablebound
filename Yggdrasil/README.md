# octopus-challenge

This small program creates `site outages` in Kraken Flex ecosystem, given a `site id` and a `start date`.

### Quick start

If you want to run with:

-   site id: `norwich-pear-tree`
-   start date: `2022-01-01T00:00:00.000Z`

then replace `<INSERT_API_KEY>` with Kraken Flex API key and run:

-   `nvm install;KRAKENFLEX_TOKEN=<INSERT_API_KEY> npm run up`

## How to run

### Environment

-   Duplicate `.env.example`, rename to `.env` and fill in the values

### Execution

#### CLI

`npm i` to install dependencies

`npm run start` to run the program

`npm run dev` to run with nodemon

`npm run test` to run tests

#### Docker

`docker-compose up app` to run the program

`docker-compose up test-unit` to run tests

## Some To-do's:

-   Using a logger, for example `pino`
-   Validating API responses
