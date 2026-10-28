# QuickCop webScraper-api

This NestJS API accepts a public product-page link and returns its name and listed price when the page exposes usable product metadata. It checks JSON-LD, embedded JSON, Open Graph/product meta tags, and HTML microdata such as `itemprop` values in that order.

## Run locally

Use Node.js 22.14.0 and install dependencies at the repository root:

```bash
npm ci
npm run webscraper:start
```

The API listens on `http://localhost:3000`.

## Endpoint

`POST /product-previews`

Request body:

```json
{
  "url": "https://www.somewebsite.com"
}
```

Successful response:

```json
{
  "name": "Some Hyped Up Product",
  "priceCents": 15000,
  "currency": "USD",
  "sourceUrl": "https://www.somewebsite.com",
  "images": ["https://cdn.somewebsite.com/products/example.jpg"]
}
```

`priceCents` is an integer, so `$150.00` is returned as `15000`; avoid converting it to a floating-point amount for storage.

`images` contains zero or more validated HTTP(S) image URLs discovered from generic product metadata. The API returns URLs rather than embedding or downloading image bytes. Relative URLs are resolved against the submitted product URL, and duplicate or unsupported-protocol URLs are ignored.

Failure responses use this shape:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product name or price was not found."
  }
}
```

Possible error codes are `INVALID_URL`, `UNSAFE_URL`, `FETCH_FAILED`, `UNSUPPORTED_PAGE`, and `PRODUCT_NOT_FOUND`.

## Terminal demo

Start the API in one terminal:

```bash
npm run webscraper:start
```

In another terminal, run:

```bash
npm run webscraper:demo
```

Paste a product URL at the prompt. The demo prints the product name, formatted price, source URL, and any returned image URLs.

## Limits and safety

The API only fetches public HTTPS links. It follows up to five redirects, revalidating every destination as a public HTTPS URL, and rejects non-HTML responses and pages larger than 1 MB. It does not execute JavaScript or bypass site protections. Some sites require JavaScript, block automated requests, or omit product metadata; those pages return an error instead of an unreliable result.

The scraper is intentionally generic: it does not contain retailer-specific selectors. It can read prices formatted as plain numbers, currency-prefixed values such as `$1,299.99`, or values with a trailing ISO currency code. A retailer bot challenge is reported as `UNSUPPORTED_PAGE`; use an approved retailer API or a browser-based integration if that retailer does not expose public product HTML.
