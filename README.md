# scaff-backend

A Node.js (TypeScript) backend for managing companies, users, devices, and super admin features. Uses Express, Prisma, MySQL, AWS SES, Redis, and Sentry.

---

## Features

- Company registration, login, approval, and management
- User/member management
- Device token management
- Super admin dashboard and authentication
- JWT authentication and role-based access
- Error handling and validation (Zod)
- AWS SES email integration
- Redis and Sentry integration

---

## Project Structure

```
src/
  app.ts                # Express app entry point
  config/               # Configuration files (Prisma, AWS, Redis, Sentry, DB)
  controllers/          # Express route controllers
  helpers/              # Utility functions (e.g., email, ID generation)
  middlewares/          # Express middlewares (auth, error)
  routes/               # Express route definitions
  schemas/              # Zod validation schemas
  services/             # Business logic and DB access
  types/                # TypeScript types and interfaces
prisma/
  schema.prisma         # Prisma schema for MySQL
.env                    # Environment variables (not committed)
Dockerfile              # Docker build instructions
```

---

## Environment Variables

Create a `.env` file in the root with the following (see `.env` for all):

```
PORT=8000
DATABASE_URL="mysql://user:password@host:port/db"
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=admin
DB_PASSWORD=yourpassword
DB_NAME=SCAFF_BACKEND

JWT_SECRET="your-secret"
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=...
EMAIL_FROM=...
REDIS_HOST=localhost
REDIS_PORT=6379
SENTRY_DSN=...
```

---

## Local Development

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Generate Prisma client:**
   ```sh
   npx prisma generate
   ```

3. **Build TypeScript:**
   ```sh
   npm run build
   ```

4. **Start the server:**
   ```sh
   npm start
   ```

---

## Docker Usage

1. **Build the Docker image:**
   ```sh
   docker build -t scaff-backend .
   ```

2. **Run the container:**
   ```sh
   docker run --env-file .env -p 8000:8000 scaff-backend
   ```

> Make sure your MySQL database is accessible to the container. For local development, consider using Docker Compose.

---

## API Endpoints

- `POST /api/v1/company/registerCompany` - Register a new company
- `POST /api/v1/company/companyLogin` - Company login
- `PUT /api/v1/company/updatedCompanyDetails` - Update company details
- `GET /api/v1/company/getAllCompnay` - Get all companies (Super Admin)
- `GET /api/v1/company/getCompanyById` - Get company by ID (Super Admin)
- `POST /api/v1/company/approveCompanyrequest` - Approve company request (Super Admin)
- `POST /api/v1/company/rejectCompanyrequest` - Reject company request (Super Admin)
- `GET /api/v1/company/searchCompany` - Search company (Super Admin)
- `POST /api/v1/company/addNewCompanyBySuperAdmin` - Add a new company (Super Admin)
- `PATCH /api/v1/company/blockCompanyBySuperAdmin` - Block a company (Super Admin)
- `PATCH /api/v1/company/unblockCompanyBySuperAdmin` - Unblock a company (Super Admin)
- `DELETE /api/v1/company/deleteCompanyBySuperAdmin` - Delete a company (Super Admin)
- `PUT /api/v1/device/updateDevice` - Update device token (Authenticated)
- `POST /api/v1/superAdmin/login` - Super admin login
- `GET /api/v1/superAdmin/dashboardData` - Super admin dashboard

See [`src/routes/`](src/routes/) for all endpoints.

---

## Scripts

- `npm run build` - Compile TypeScript to `dist/`
- `npm start` - Build and start with nodemon
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:studio` - Open Prisma Studio

---

## Testing

- Jest is configured for unit testing.
- To run tests:
  ```sh
  npm test
  ```

---

## License

MIT

---

**For more details, see the source code and comments in each