# API Documentation

Base URL (local): `http://localhost:3000`

All responses use JSON:

- Success:
  - `{ "success": true, "data": { ... } }`
- Error:
  - `{ "success": false, "error": { "code": "ERROR_CODE", "message": "..." } }`

## Authentication

### `POST /api/auth/signup`

- Auth required: No
- Body:

```json
{
  "name": "Jane Founder",
  "email": "jane@example.com",
  "password": "password123"
}
```

- Response `201`:

```json
{
  "success": true,
  "data": {
    "token": "jwt",
    "user": {
      "id": "clx...",
      "name": "Jane Founder",
      "email": "jane@example.com",
      "bio": null,
      "avatarUrl": null
    }
  }
}
```

### `POST /api/auth/login`

- Auth required: No
- Body:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

- Response `200`:

```json
{
  "success": true,
  "data": {
    "token": "jwt",
    "user": {
      "id": "clx...",
      "name": "Jane Founder",
      "email": "jane@example.com",
      "bio": null,
      "avatarUrl": null
    }
  }
}
```

### `POST /api/auth/password-reset`

- Auth required: No
- Body:

```json
{
  "email": "jane@example.com"
}
```

- Response `200`:

```json
{
  "success": true,
  "data": {
    "message": "If an account exists for that email, a password reset link has been generated."
  }
}
```

### `GET /api/auth/me`

- Auth required: Yes (JWT in `Authorization: Bearer <token>` or HttpOnly cookie)
- Response `200`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "name": "Jane Founder",
      "email": "jane@example.com",
      "bio": "Founder bio",
      "avatarUrl": "https://..."
    }
  }
}
```

### `POST /api/auth/logout`

- Auth required: No (works either way)
- Response `200`:

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

## User

### `GET /api/user/profile`

- Auth required: Yes
- Response `200`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "name": "Jane Founder",
      "email": "jane@example.com",
      "bio": "Founder bio",
      "avatarUrl": null
    }
  }
}
```

### `PUT /api/user/profile`

- Auth required: Yes
- Body:

```json
{
  "name": "Jane Founder",
  "email": "jane@example.com",
  "bio": "Updated bio",
  "avatarUrl": "data:image/png;base64,..."
}
```

- Response `200`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "name": "Jane Founder",
      "email": "jane@example.com",
      "bio": "Updated bio",
      "avatarUrl": "data:image/png;base64,..."
    }
  }
}
```

## Error Codes

- `METHOD_NOT_ALLOWED` -> invalid HTTP method (`405`)
- `VALIDATION_ERROR` -> payload validation failed (`400`)
- `UNAUTHORIZED` -> missing auth token (`401`)
- `INVALID_TOKEN` -> invalid/expired token (`401`)
- `INVALID_CREDENTIALS` -> email/password mismatch (`401`)
- `EMAIL_IN_USE` -> duplicate email (`409`)
- `USER_NOT_FOUND` -> requested user missing (`404`)
- `INTERNAL_SERVER_ERROR` -> unexpected failure (`500`)
