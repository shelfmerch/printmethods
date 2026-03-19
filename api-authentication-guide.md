# ShelfMerch Public API - Authentication Guide

Welcome to the ShelfMerch Public API! This guide explains how to generate tokens, gain identity, and start making authenticated requests to the API.

## Overview

The ShelfMerch Public API currently supports two methods for authentication:
1. **API Keys** - Best for server-to-server communication or simple scripts.
2. **Personal Access Tokens (PATs)** - Best for giving restricted access with expiration dates.

*Note: OAuth2 flows are currently disabled and will be available in a future phase.*

---

## 1. Generating Credentials

Before making requests to protected endpoints, you need to generate either an API Key or a Personal Access Token (PAT). These can be generated using the authentication endpoints.

### Generating an API Key
Send a `POST` request to `/api/v1/auth/keys`.

**Request Body:**
```json
{
  "name": "My Server Key",
  "scopes": ["read:shops", "write:products"] // Optional: defaults to your app's scopes
}
```

### Generating a Personal Access Token (PAT)
Send a `POST` request to `/api/v1/auth/tokens/personal`.

**Request Body:**
```json
{
  "name": "My Temporary Token",
  "expires_in_days": 30, // Optional expiration
  "scopes": ["read:shops"] // Optional
}
```

---

## 2. Authenticating Requests

Once you have generated your credential, you must include it in the headers of every request you make to the protected endpoints of the API. How you pass the token depends on whether it's an API Key or a PAT.

### Using an API Key
Pass your API key in the `X-API-Key` HTTP header.

**Example Request:**
```bash
curl -X GET "https://api.shelfmerch.com/api/v1/shops" \
     -H "X-API-Key: your_generated_api_key_here"
```

### Using a Personal Access Token (PAT)
Pass your PAT in the `Authorization` header as a Bearer token.

**Example Request:**
```bash
curl -X GET "https://api.shelfmerch.com/api/v1/shops" \
     -H "Authorization: Bearer your_generated_pat_here"
```

---

## 3. Checking Your Scopes & Identity

To verify your current identity and check which scopes your token or API key has access to, you can use the `/me/scopes` endpoint.

**Example Request:**
```bash
curl -X GET "https://api.shelfmerch.com/api/v1/auth/me/scopes" \
     -H "X-API-Key: your_generated_api_key_here"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "scopes": ["read:shops", "write:products"],
    "credential_type": "api_key",
    "plan": "premium_tier"
  }
}
```

You are now ready to start using the Public API!
