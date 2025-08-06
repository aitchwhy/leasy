# API Documentation

## Base URL

Development: `http://localhost:3000`

## Endpoints

### Health Check

Check if the server is running.

**GET** `/`

#### Response

```
200 OK
Content-Type: text/plain

OK
```

---

### Get Database

Returns the complete mock database.

**GET** `/db`

#### Response

```json
200 OK
Content-Type: application/json

{
  "units": [
    {
      "id": "1",
      "name": "Building A",
      "address": "123 Main St",
      "units": 10
    },
    {
      "id": "2",
      "name": "Building B",
      "address": "456 Oak Ave",
      "units": 15
    }
  ]
}
```

---

### List Buildings

Returns all buildings from the mock database.

**GET** `/buildings`

#### Response

```json
200 OK
Content-Type: application/json

[
  {
    "id": "1",
    "name": "Building A",
    "address": "123 Main St",
    "units": 10
  },
  {
    "id": "2",
    "name": "Building B",
    "address": "456 Oak Ave",
    "units": 15
  }
]
```

## Error Responses

All endpoints return standard HTTP status codes:

- `200` - Success
- `404` - Not Found (for undefined routes)
- `500` - Internal Server Error

## CORS

CORS is not currently configured. Add Hono CORS middleware if needed for browser access.

## Authentication

No authentication is currently implemented. All endpoints are public.

## Rate Limiting

No rate limiting is currently implemented.

## Future Endpoints

Potential endpoints to add:

- `POST /buildings` - Create a new building
- `GET /buildings/:id` - Get specific building
- `PUT /buildings/:id` - Update a building
- `DELETE /buildings/:id` - Delete a building
- `GET /health` - Detailed health check with dependencies
