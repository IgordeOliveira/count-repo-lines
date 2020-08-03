# REPO COUNT LINES 
[__LIVE DEMO__](https://count-repo-lines.herokuapp.com/api/repo-count-lines?repo=https://github.com/laravel/forge-monitor) | [__AVAILABLE ON DOCKERHUB__](https://hub.docker.com/r/igordeeoliveiradev/count-repo-lines)


Trustly technical challenge repository

API that returns the total number of lines and the total number of bytes of all the files of a given public Github repository, grouped by file extension.

#### This project uses:
- Node ( [Express API Starter](https://github.com/w3cj/express-api-starter) )
- Redis for cache
- Axios for HTTP requests ( Because of middleware functions (for cache, logs, etc.) )
- Mocha for testing
- Cheerio for DOM parse in node ( I saw that you were asked not to use web scrapping libs, but as there is nothing as a default for parse DOM in node, I chose to use this one. I imagine you referred to "web scrapping libs" as PhantonJS right?)


## Setup

Copy ``.env.sample`` as ``.env`` and fill in your redis server connection data  

If you don't have a redis server, in the project there is a docker-compose for a local network, so `docker-compose up -d`  

Then install the dependencies

```
yarn install
```

## Development Server

```
yarn dev
```

## How to use

Make a GET Request to http://localhost:5000/api/repo-count-lines?repo={{REPO_URL}}  
_REPO_URL need this in this formart: https://github.com/IgordeOliveira/count-repo-lines_

## Test

```
yarn test
```

