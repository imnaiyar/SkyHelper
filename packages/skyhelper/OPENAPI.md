# OpenAPI Specification Generation

The SkyHelper package now includes comprehensive OpenAPI specification generation using NestJS Swagger.

## Features

- **Complete API Documentation**: All endpoints are documented with descriptions, parameters, request/response schemas
- **Authentication Documentation**: Bearer token authentication is properly documented for protected endpoints
- **Interactive Documentation**: Swagger UI is available in development mode
- **Schema Validation**: Request and response schemas are automatically generated from DTOs
- **Tag Organization**: Endpoints are organized by functional areas (Application, Bot Statistics, Guild Management, etc.)

## Usage

### Generate OpenAPI Specification File

Run the following command to generate the OpenAPI specification as a JSON file:

```bash
pnpm run generate:openapi
```

This will create an `openapi.json` file in the package root containing the complete API specification.

### Development Mode with Swagger UI

When running the application in development mode, Swagger UI is automatically available at `/api/docs`:

```bash
# Set environment variable to enable Swagger UI
export NODE_ENV=development
# or
export ENABLE_SWAGGER=true

# Start the application
pnpm run dev
```

Then visit `http://localhost:8080/api/docs` to access the interactive Swagger UI.

## API Documentation Overview

The generated OpenAPI specification includes:

### Endpoints by Category

1. **Application** (`/`)

   - Health check endpoint
   - Shard embed generation
   - Event times embed generation

2. **Bot Statistics** (`/stats`)

   - Bot performance metrics
   - Available spirits list

3. **Guild Management** (`/guilds/{guild}`)

   - Guild information and settings
   - Feature management (live-updates, reminders)
   - Channel and role listings

4. **User Management** (`/users/{user}`)

   - User preferences
   - Linked role metadata

5. **Game Data Updates** (`/update`)

   - Traveling Spirit data
   - Event information
   - Daily quests

6. **Discord Webhooks** (`/webhook-event`)
   - Internal Discord webhook handlers

### Authentication

Most endpoints require Bearer token authentication:

```
Authorization: Bearer <discord_oauth2_token>
```

### Request/Response Formats

All endpoints use JSON format for requests and responses. The specification includes:

- Parameter descriptions and examples
- Request body schemas
- Response schemas with status codes
- Error response documentation

## Implementation Details

The OpenAPI generation is implemented using:

- `@nestjs/swagger` for decorators and document generation
- Custom DTOs with `@ApiProperty` decorators
- Comprehensive controller documentation with `@ApiOperation`, `@ApiResponse`, etc.
- Bearer authentication scheme configuration
- Custom Swagger UI styling and configuration

## Generated Specification

The generated `openapi.json` file includes:

- Complete endpoint documentation (14 paths)
- Authentication schemes
- Component schemas
- Server configurations
- Contact and license information
- Comprehensive descriptions and examples

This provides a complete reference for API consumers and enables easy integration with OpenAPI tooling.
