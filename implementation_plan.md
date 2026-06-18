# Fix TypeScript Compilation Errors

## Goal Description
We need to resolve the compilation errors that prevent the project from building. The main issues are:
- Date fields are strings instead of `Date` objects.
- Missing Prisma model `siteMaterial` referenced in `db-service.ts`.
- Incorrect property names such as `approxFinalWorkAmount`.
- Optional fields mismatches (`workId` in `TarLoad`).
- Middleware still imports `NextApiRequest/Response`.
- `db-service.ts` default export issue.

## User Review Required
[!IMPORTANT]
- **Schema changes**: Add a `SiteMaterial` model to `prisma/schema.prisma`. Confirm any migration needed.
- **Date handling**: Replace mock data `updatedAt: new Date().toISOString()` with `new Date()` objects.
- **Export style**: Change `db-service.ts` to named export `export const dbService = new DbService();` and adjust imports.
- **Property renaming**: Ensure `PrivateWork` uses correct fields (`approxAmount`, `finalWorkAmount`).

## Open Questions
- Should we run `npx prisma migrate dev` after adding the new model?
- Do you prefer `siteMaterial` name or another name that matches existing code?
- Any additional fields needed for `SiteMaterial` beyond those used?

## Proposed Changes
---
### Prisma Schema
#### [NEW] `prisma/schema.prisma`
```diff
@@
+model SiteMaterial {
+  id                     String   @id @default(uuid())
+  entryId                String
+  type                   String   // to_deliver or delivered
+  itemSlNo               String
+  specName               String
+  estimatedQuantity      Int
+  deliveredQuantityInCft Int
+  balanceQuantityInCft   Int
+  totalQuantityInSite    Int
+  createdAt              DateTime @default(now())
+}
```
---
### db-service.ts
#### [MODIFY] `src/lib/db-service.ts`
- Replace all `updatedAt: new Date().toISOString()` with `updatedAt: new Date()`.
- Change the export to a named export:
```diff
-export const dbService = new DbService();
+export const dbService = new DbService(); // already named, just ensure imports use { dbService }
```
- Update `createSiteMaterial` and related methods to use `prisma.siteMaterial` (now exists).
- Align `PrivateWork` payload to use `approxAmount` and `finalWorkAmount` fields.
- Ensure `TarLoad` objects set `workId: null` when undefined.
---
### Middleware
#### [MODIFY] `src/middleware/rateLimiter.ts`
- Remove imports of `NextApiRequest`/`NextApiResponse` and use Express `Request`, `Response` types.
---
### Import Adjustments
#### [MODIFY] Files importing dbService
- Change default import to named import:
```diff
-import dbService from '../../lib/db-service';
+import { dbService } from '../../lib/db-service';
```
---
## Verification Plan
### Automated Tests
- Run `npx tsc --noEmit` to ensure no TypeScript errors.
- Start dev server `npm run dev` and verify pages load.
### Manual Verification
- Open the app, log in with existing credentials, navigate to dashboard, site materials, tar loads, and private work pages to confirm data displays correctly.

**End of Implementation Plan**
