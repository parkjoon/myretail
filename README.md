# myRetail Case Study

* [Quick Start](#quick-start)
* [Requirements](#requirements)
* [Assumptions](#assumptions)
* [Proof of Concept](#proof-of-concept)
* [Testing](#testing)
* [Production Ready Checklist](#production-ready-checklist)

## Quick Start

View the Heroku hosted version here: <https://myretail-joon.herokuapp.com/>

**There are two apps: the frontend react app, and the Express REST API.**

Please install dependencies for both apps separately, build the frontend app, then start the Express server. 

1. `cd client && yarn && yarn build`
   * This installs the dependencies for the frontend app, builds it, and copies the build to the server folder for serving.
2. `cd server && yarn && yarn start`
   * This installs the dependencies for the REST API and starts the server, while serving the frontend build copied from step 1. 
3. Navigate to `localhost:3000`

Note: the above steps will fetch from the Redsky API and fetch from a Heroku hosted Redis store.

To run the app with no external API dependencies, please run the server with `NODE_ENV=test yarn start`

<p align="center">
  <img width="450px" alt="frontend demo" src="/readme-assets/frontend-demo.png" />
</p>

Run tests with `yarn test`.

## Requirements

* **Build a REST API that aggregates product data from multiple sources and responds with JSON**
  * Product details will come from redsky.target.com
  * Product price info comes from a database of choice
  * Support GET request at /products/{tcin}
  * Support PUT request at /products/{tcin} to update price
* HQ is in Virginia, with over 200 stores across east coast
* Data should be available to any number of client devices (internal and external)

[Case Study Prompts](/readme-assets/case-study-prompts.docx)

## Assumptions

* How accurate does the product details data have to be?
  * Assuming details data does not need to always be accurate
* How accurate does the product price info data have to be?
  * Assuming price info always needs to be accurate
* Can we assume no other actor will update the price info?
  * Assuming no other actor (other than our API) will update the price info
* Any restricted tools (eg. no AWS, due to direct competition)
  * Assuming no restrictions on tools
* Redsky is an internal API with a distributed and robust system
  * Assuming it is, we can consider it as part of our closed loop system
* How many total products?
  * Assume 10 million products (approximately 1/3 size of Walmart)
* How many GET requests can we expect?
  * If all stores in east coast, let's assume the customer base is at most the entire population of east coast states
    * According to US census, population of east coast states is about 60 million people
  * Assuming our most loyal customers use the site once a day and based on the 20-80 rule, assume 20% of our customer base will visit the site once a day
    * 60 million people * 20% = 12 million customers (generate "most" of our traffic)
  * eCommerce average session duration is 3.5 minutes and assume our average page view time is 1 min
    * Assume 1 page corresponds to approximately 1 API request
    * 12 million people viewing 3.5 "pages" = 42 million requests per day
  * Assume 80% of our traffic will be accessed during business hours (9 AM - 5 PM) = 8 hours
    * 42 million requests * 80% = 33.6 million requests (8 hours) => 4.2 million requests / hour => ~1200 requests / second
  * Assume edge & API gateway caching is not considered due to earlier assumption that price should always be accurate
  * If in-memory cache uses LRU (least recently used) eviction policy with 200 Mb capacity
    * If price info consists of a stringified JSON object of price and currency unit
      * Example key = `12345678` (8 characters), example value = `{"price":99.99,"currency":"$"}` (30 characters)
      * Assume 1 character is 5 bytes in Nodejs ES6 (not always true but is generally the upper limit)
      * (8 characters + 30 characters) * 5 bytes = 190 bytes => 200 Mb / 190 bytes = ~1 million product price info in cache
    * Using 20-80 rule, assume 20% of our products generate most of our traffic
      * 10 million products * 20% = 2 million products
      * 2 million total products / 1 million products cached (see above) = 50% cache hit rate for in memory cache
  * **1200 requests / second * 50% cache miss rate = 600 requests / second**
* How many PUT requests can we expect?
  * Assume 10 price "admins" for each store
    * 200 stores * 10 admins = 2000 admins
  * Assume price on average changes once an hour, during business hours only (9 AM - 5 PM) = 8 hours
    * **2000 requests / hour => ~0.5 requests / second**
  * No cache benefits due to earlier assumption that price info must always be accurate
* If I use Heroku (for POC), then we can expect max 4500 requests / hour => 1.25 requests / second
  * We would not scale in production with Heroku, but hypothetically if we did, we need:
    * **(1200 req/s (GET) + 0.5 req/s (PUT)) / 1.25 req/s (Heroku dyno) = 960 Heroku dynos**

## Proof of Concept

* **Use create-react-app for a simple frontend interface**
  * Product search field
    * Search product by tcin
  * Product detailed view
    * Display the currently selected product and a form to update price
  * Featured products
    * Display the images of the 4 example products specified in the requirements document
* **Use Express.js to for a REST API web server**
  * GET /products/
    * Return the product data for the featured products mentioned above
  * GET /products/{tcin}
    * Return the product data for the specified tcin
  * PUT /products/{tcin}
    * Update the price for the specified tcin
* **Fetch product details from Redsky API using Axios**
* **Fetch product price info from Redis (hosted by Heroku)**
  * key = tcin, value = stringified JSON object of price and currency
* **Use a simple but unoptimized implementation of LRU cache for in memory cache**
  * Use ES6 Map
  * Not performance optimized but functional LRU eviction policy as proof of concept

<p align="center">
  <img width="700px" alt="poc architecture" src="/readme-assets/poc-architecture.png" />
</p>

<p align="center">
  <img width="700px" alt="poc rest api" src="/readme-assets/poc-rest-api.png" />
</p>

<p align="center">
  <img width="700px" alt="poc frontend mock" src="/readme-assets/poc-frontend-mock.png" />
</p>

<p align="center">
  <img width="700px" alt="poc frontend" src="/readme-assets/poc-frontend.png" />
</p>

## Testing

* Tools
  * Jest - test runner
  * Supertest - abstraction for testing HTTP

* Test Cases
  * isPriceValid helper
    * Returns true for any valid whole number
    * Converts input to number
    * Returns true for up to 2 decimal places
  * getProduct helper
    * Returns product details and priceInfo
    * Returns cached value if found
    * Returns price info when product details call fails
    * Returns product details when product price info call fails
    * Returns no data when both product details and price info calls fail
    * Sets product cache when data resolves successfully
  * Product Cache (LRU)
    * Can set max size of cache with constructor
    * Can get value from cache with key
    * Can set value in cache with key and value
    * Can delete key and value from cache with key
    * Getting an existing key moves its order to the most recently used position
    * Setting an existing key moves its order to the most recently used position
    * Setting a new key and value when capacity is full evicts the least recently used key and value
  * GET /products/
    * Returns product data for all products
  * GET /products/{tcin}
    * Returns product data for specified tcin
    * Returns an error when invalid tcin is specified
  * PUT /products/{tcin}
    * Price is updated in store
    * Cached product data is removed from cache
    * Uses fallback currency from existing price info data when currency input is missing
    * Returns a status 201 when price info has been created for a new key
    * Returns a status 400 error when price is invalid

## Production Ready Checklist

* **Security**
  * Enable HTTPS
  * Place PUT operation under API key or public key
  * Client side API requests should be routed internally
  * Implement client to node encryption on price database 
  * Add input sanitization when updating price
* **Performance**
  * Need to support minimum 1200 requests/second (see assumptions section)
    * Initial traffic assumptions based on the majority of traffic happening 9 AM - 5 PM, but does not take into account realistic factors, such as shoppers past 5 PM and different time zones
    * Implement Kubernetes horizontal autoscaling based on time of day and historical data
    * Consider adding buffer resources of 10% or at least 1 standard deviation of historical traffic data
  * Migrate price info to Cassandra clusters
    * Extremely fast (mostly reads but also writes)
    * Available and partition tolerant (in CAP theorem)
    * Use consistent hashing to optimize traffic spread and scaling
    * Index products by categories based on an assumption the customers will shop based on categories or departments
  * Replace simple LRU cache with memcache with two levels L1 & L2
    * L2 should be a redundant copy of L1 in case of failure
    * Prime cache with historically popular products on server start
  * Add edge caching for frontend assets
  * Add API gateway caching for REST API calls (eg. Redsky calls)
  * For special events we can expect acute traffic, such as game console releases, create separate caching mechanisms with the intention of creating a "walled garden" around the event specific traffic so that it has little negative impact to the rest of the site.
    * Consider separate hosted cache clusters, leveraging CDN, increasing cache lifetime client side, etc.
    * Note, potential cost to data accuracy and consistency.
  * Further optimize performance by adding validation between API calls
  * Potentially migrate Express.js web server to Golang (or other more performant options)
    * Golang is better optimized for concurrency
* **Operations**
  * Split up frontend and backend into separate work flows
  * Containerize each solution and deploy, scale, and monitor with Kubernetes
    * Fast and robust deployment & scaling tools
  * Completely separate backend tests and mocks into a separate mock server.
  * Integrate end to end CI & CD solutions
  * Create frontend app unit, integration, and functional tests
    * React Testing Library (for integration tests)
    * TestCafe + Testing Library (for functional tests)
  * As per assumptions section, if we expect 10 million products, a 10% increase every year, and price data is 190 bytes with no change
    * 10 million products * 190 bytes = 1.9 Gigabytes
    * Allocate at least twice as much (around 4 Gigabytes) and maintain multiple clouds across the country
    * After 5 years => 10 million products * (110% ^ 5 years) = 16 million products
    * 16 million products * 190 bytes = 3 Gigabytes
    * Database storage should not need upgrading at least for 5 years
* **Observability**
  * Stream REST API logs to Splunk
    * Reliable streamed writes
    * Fast indexing and searching
  * Stream frontend logs to Splunk
  * Identify KPIs and ensure business has appropriate insight into traffic and usage
* **User Experience**
  * Add more graceful error handling scenarios
  * Validate and throttle API requests

<p align="center">
  <img width="700px" alt="north star architecture" src="/readme-assets/north-star-architecture.png" />
</p>

[Architecture Diagrams](/readme-assets/architecture.drawio)
