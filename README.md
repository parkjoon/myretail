# myRetail Case Study

## Requirements

* Build a REST API that aggregates product data from multiple sources and responds with JSON
  * Product details will come from redsky.target.com
  * Product price info comes from a database of choice
  * Support GET request at /products/{tcin}
  * Support PUT request at /products/{tcin} to update price
* HQ is in Virginia, with over 200 stores across east coast
* Data should be avilable to any number of client devices (internal and external)

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
  * Assuming it is, and we can consider it as part of our closed loop system
* How many total products?
  * Assume 10 million products (approximately 1/3 size of Walmart)
* How many GET requests can we expect?
  * If all stores in east coast, let's assume the customer base is at most the entire population of east coast states
    * According to US census, population of east coast states is about 60 million total
  * Based on the 20-80 rule, assume 20% of our customer base will visit the site once a day
    * 60 million * 20% = 12 million
  * eCommerce average session duration is 3.5 minutes and assume average page view time is 1 min
    * Assume 1 page corresponds to approximately 1 API request
    * 12 million people viewing 3.5 "pages" = 42 million requests per day
  * Assume 80% of our traffic will be accessed during business hours (9 AM - 5 PM) = 8 hours
    * 42 million * 80% = 33.6 million (8 hours) => 4.2 million / hour => ~1200 requests / second
  * Assume edge & API gateway caching is not considered due to earlier assumption that price should always be accurate
  * If in memory cache uses LRU eviction policy with 200 Mb capacity
    * If price info consists of a stringified JSON object of price and currency unit
      * Example key = '12345678' (8 characters), example value = '{"price":99.99,"currency":"$"}' (30 characters)
      * Assume 1 character is 5 bytes in Nodejs ES6
      * (8 characters + 30 characters) * 5 bytes = 190 bytes => 200 Mb / 190 bytes = ~1 million product price info in cache
    * Using 20-80 rule, 20% of our products generate most of our traffic
      * 10 million * 20% = 2 million products
      * 2 million total products / 1 million products cached = 50% cache hit rate for in memory cache
  * 1200 requests / second * 50% cache miss rate = 600 requests / second
* How many PUT requests can we expect?
  * Assume 10 price "admins" for each store
    * 200 stores * 10 admins = 2000 admins
  * Assume price on average changes once an hour, during business hours only (9 AM - 5 PM) = 8 hours
    * 2000 requests / hour => ~0.5 requests / second
  * No cache benefit due to earlier assumption that price info must always be accurate

## Proof of Concept

* Use create-react-app for a simple frontend interface
  * Product search field
  * Product detailed view
  * Featured products
* Use Express.js to for a REST API web server
  * GET /products/
  * GET /products/{tcin}
  * PUT /products/{tcin}
* Fetch product details from Redsky API using Axios
* Fetch product price info from Redis (hosted by Heroku)
  * key = tcin, value = stringified JSON object of price and currency
* Use a simple but unoptimized implementation of LRU cache for in memory cache
  * Use ES6 Map

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

* Security

  * Enable HTTPS
  * Place PUT operation under API key or public key
  * Client side API requests should be routed internally
  * Add input sanitization when updating price

* Performance

  * Migrate price info to Cassandra clusters
    * Extremely fast (mostly reads but also writes)
    * Available and partition tolerant (in CAP theorem)
  * Replace simple LRU cache with memcache
  * Add edge caching for frontend assets
  * Add API gateway caching for REST API calls (eg. Redsky calls)
  * Further optimize performance by adding validation between API calls
  * Potentially migrate Express.js web server to Golang (or other more performant options)
    * Golang is better optimized for concurrency

* Operations

  * Split up frontend and backend into separate work flows
  * Containerize each solution and deploy, scale, and monitor with Kubernetes
    * Fast and robust deployment & scaling tools
  * Completely separate backend tests and mocks into a separate mock server.
  * Integrate end to end CI & CD solutions
  * Create frontend app unit, integration, and functional tests
    * React Testing Library (for integration tests)
    * TestCafe + Testing Library (for functional tests)

* Observability

  * Stream REST API logs to Splunk
    * Reliable streamed writes
    * Fast indexing and searching
  * Stream frontend logs to Splunk

* User Experience

  * Add more graceful error handling scenarios
  * Validate and throttle API requests

