# QuickCop Product-preview API

This NestJS API accepts a public product-page link and returns its name and listed price when the page exposes usable JSON-LD product metadata.

## Run locally

Use Node.js 22.14.0 and install dependencies at the repository root:

```bash
npm ci
npm run api:start
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
  "sourceUrl": "https://www.somewebsite.com"
}
```

`priceCents` is an integer, so `$150.00` is returned as `15000`; avoid converting it to a floating-point amount for storage.

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
npm run api:start
```

In another terminal, run:

```bash
npm run api:demo
```

Paste a product URL at the prompt. The demo prints the product name, formatted price, and source URL.

## Limits and safety

The API only fetches public HTTPS links. It rejects redirects, non-HTML responses, and pages larger than 1 MB. It does not use a browser or bypass retailer protections. Some retailers require JavaScript, block automated requests, or omit product metadata; those pages return an error instead of an unreliable result.
