# n8n-nodes-zillapi

**Zillapi: Zillow property data for n8n.** Also available as an [MCP server](https://github.com/ZeroPointRepo/zillow-mcp) and [agent skills](https://github.com/ZeroPointRepo/zillow-skills).

This is an n8n community node for [Zillapi](https://zillapi.com): look up any US property by address, zillow.com URL or zpid and get price, Zestimate, photos, schools, taxes, price history and listing agent contact, or search for sale, for rent and sold listings, all from one node with one credential.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide for community nodes](https://docs.n8n.io/integrations/community-nodes/installation/):

1. In n8n, go to **Settings > Community Nodes**.
2. Select **Install**, enter `n8n-nodes-zillapi`, and confirm.

## Credentials

You need a Zillapi API key (starts with `zk_`):

1. Create an account at [zillapi.com/signup](https://zillapi.com/signup): 100 free credits, no card required. Plans and current prices: [zillapi.com/pricing](https://zillapi.com/pricing/).
2. Copy your API key from the dashboard.
3. In n8n, create a **Zillapi API** credential and paste the key.

The credential test uses the free account endpoint and consumes no credits.

## Operations

| Operation | What it does | Credits |
|---|---|---|
| **Get by Address** | Full property record (300+ fields) from a US street address | 3 |
| **Get by URL** | Full property record from a pasted zillow.com link | 1 per record |
| **Get by Zpid** | Full property record from a numeric Zillow property ID, cache-served when fresh | 1 |
| **Get Zestimate** | Just the Zestimate, rent Zestimate, tax assessed value and last sold price | 1 |
| **Get Sub-Resource** | One slice of a record: photos, price history, tax history, schools, nearby, agent, open houses or facts | 1 |
| **Search Listings** | For sale, for rent or sold listings by location or bounding box with filters | 1 per result |
| **Get Profile / Get Usage** | Account plan, credit balance and usage | Free |

Failed calls are never charged. Search credits scale with results returned, so keep **Max Results** tight.

The lookup operations accept a **Fields** option (comma-separated dotted paths like `zpid,price,zestimate,address.streetAddress`) to shrink the 300+ field record to just the slice you need.

## Compatibility

Requires n8n version 1.0 or later and Node.js 18.10+.

## Resources

- [Zillapi quickstart](https://zillapi.com/quickstart/)
- [API reference](https://zillapi.com/api/properties/)
- [OpenAPI spec](https://zillapi.com/openapi.json)
- Family: [MCP server](https://github.com/ZeroPointRepo/zillow-mcp) and [agent skills](https://github.com/ZeroPointRepo/zillow-skills)

## Disclosure

Zillapi is an independent service and is not affiliated with, endorsed by, or sponsored by Zillow Group, Inc. "Zillow" and "Zestimate" are registered trademarks of Zillow Group, Inc.

## License

[MIT](LICENSE)
