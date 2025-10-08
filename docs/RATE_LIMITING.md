# Rate Limiting Implementation

## Overview

This document describes the rate limiting implementation for the SkyHelper API.

## Configuration

### Rate Limit Settings

- **Limit**: 100 requests per minute per IP address
- **Window**: 60 seconds (sliding window)
- **Implementation**: Using @nestjs/throttler v6.4.0

### Exemptions

Requests from the following dashboard origins are **exempt** from rate limits:

- `http://localhost:3000`
- `https://dash.skyhelper.xyz`
- `https://skyhelper.xyz`
- `https://dashboard.skyhelper.xyz`
- `https://preview.skyhelper.xyz`
- `https://next.skyhelper.xyz`
- `https://docs.skyhelper.xyz`

The exemption is determined by checking the `Origin` header against `config.DASHBOARD.WEB_URL`.

## Architecture

### CustomThrottlerGuard

Location: `packages/skyhelper/src/api/guards/throttler.guard.ts`

This custom guard extends NestJS's `ThrottlerGuard` and overrides the `shouldSkip` method to check if the request origin is in the allowed dashboard URLs list.

```typescript
protected override shouldSkip(context: ExecutionContext): Promise<boolean> {
  const request = context.switchToHttp().getRequest();
  const origin = request.headers.origin as string | undefined;

  if (origin && config.DASHBOARD.WEB_URL.includes(origin)) {
    return Promise.resolve(true);
  }

  return Promise.resolve(false);
}
```

### Integration

The guard is applied globally via the `APP_GUARD` provider in `main.ts`:

```typescript
providers: [
  { provide: APP_FILTER, useValue: SentryGlobalFilter },
  { provide: APP_GUARD, useClass: CustomThrottlerGuard },
  { provide: "BotClient", useValue: client },
],
```

## Response Behavior

### Rate Limited Response

When rate limited, clients receive:

- **Status Code**: `429 Too Many Requests`
- **Header**: `Retry-After` (indicates seconds to wait before retrying)

### Recommended Client Behavior

Clients should implement exponential backoff retry logic:

```typescript
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    const response = await fetch(url, options);

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get("Retry-After") || "60");
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      continue;
    }

    return response;
  }
  throw new Error("Max retries exceeded");
}
```

## Testing

### Unit Tests

Location: `packages/skyhelper/__tests__/throttler.guard.test.ts`

Tests cover:

1. ✅ Skips rate limiting for dashboard origins (dash.skyhelper.xyz)
2. ✅ Skips rate limiting for localhost dashboard (localhost:3000)
3. ✅ Does NOT skip rate limiting for non-dashboard origins
4. ✅ Does NOT skip rate limiting when origin header is missing

### Manual Testing

A test script is available at `/tmp/test-rate-limit.mjs` for manual verification:

```bash
# Start the API server first
cd packages/skyhelper && pnpm dev

# In another terminal, run the test script
API_URL=http://localhost:5001 node /tmp/test-rate-limit.mjs
```

## Documentation

### Swagger/OpenAPI

The Swagger documentation (`/api/docs` when running in development) includes:

- Rate limit information in the API description
- Details about 100 requests per minute limit
- Information about dashboard exemptions

### User Documentation

The OpenAPI documentation in `apps/docs/content/docs/openapi/index.mdx` includes:

- Detailed rate limit specifications
- List of exempt dashboard origins
- HTTP 429 response code documentation
- Best practices for handling rate limits
- Example retry logic implementation

## Monitoring Recommendations

To monitor rate limiting in production:

1. **Track 429 Responses**: Monitor the number of 429 responses to identify if limits need adjustment
2. **Analyze Origins**: Check which origins are hitting rate limits most frequently
3. **Review Exemptions**: Periodically review if dashboard exemptions are working correctly
4. **Adjust Limits**: Based on usage patterns, consider adjusting the limit (currently 100/minute)

## Configuration Changes

To modify rate limits, update the ThrottlerModule configuration in `packages/skyhelper/src/api/main.ts`:

```typescript
ThrottlerModule.forRoot([
  {
    ttl: 60000, // Time window in milliseconds (60 seconds)
    limit: 100, // Maximum requests per window
  },
]),
```

To add/remove dashboard exemptions, update `config.DASHBOARD.WEB_URL` in `packages/skyhelper/src/config.ts`.
