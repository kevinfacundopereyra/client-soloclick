# API Endpoints Reference

Basado en tu estructura de backend actual con NestJS.

## POST /users/register

**Body (CreateUserDto):**
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com", 
  "password": "123456",
  "phone": "+54 11 1234-5678",
  "city": "Buenos Aires"
}
```

**Response esperada:**
```json
{
  "_id": "64f1234567890abcdef123456",
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "phone": "+54 11 1234-5678",
  "city": "Buenos Aires",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Nota:** Si tu backend devuelve un token JWT para autenticación, asegúrate de incluirlo en la respuesta.

## POST /professionals

**Body (CreateProfessionalDto):**
```json
{
  "name": "Dr. María González",
  "email": "maria@email.com",
  "password": "123456", 
  "phone": "+54 11 8765-4321",
  "city": "Córdoba",
  "specialty": "Dermatología"
}
```

**Response esperada:**
```json
{
  "_id": "64f1234567890abcdef123457",
  "name": "Dr. María González", 
  "email": "maria@email.com",
  "phone": "+54 11 8765-4321",
  "city": "Córdoba",
  "specialty": "Dermatología",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Nota:** Si tu backend devuelve un token JWT para autenticación, asegúrate de incluirlo en la respuesta.

## POST /api/auth/login

**Body:**
```json
{
  "email": "juan@email.com",
  "password": "123456"
}
```

**Response exitosa:**
```json
{
  "success": true,
  "message": "Login exitoso", 
  "user": {
    "id": "64f1234567890abcdef123456",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "userType": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## POST /auth/login

**Body:**
```json
{
  "email": "juan@email.com",
  "password": "123456"
}
```

**Response esperada:**
```json
{
  "user": {
    "_id": "64f1234567890abcdef123456",
    "name": "Juan Pérez",
    "email": "juan@email.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Responses de error comunes

**Error de validación (400):**
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

**Conflicto - Email ya existe (409):**
```json
{
  "statusCode": 409,
  "message": "El email ya está registrado",
  "error": "Conflict"
}
```

**Error interno del servidor (500):**
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```