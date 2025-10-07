# EFT Numbering Migration for All EFT Types

## Overview

The EFT numbering system has been updated to provide better separation between different types of EFT systems:

- **Real Estate Trust Payments**: Now start from **1000** instead of **100**
- **Commission Trust Payments**: Now start from **2000** instead of **200**
- **General Account EFTs**: Now start from **3000** instead of **300**
- **Standard EFTs**: Now start from **4000** instead of **300**

This change provides clear separation between the different EFT types and allows for more EFT numbers in the future.

## Changes Made

### 1. Real Estate Trust EFT Updates (`backend/models/RealEstateTrustEFT.js`)

- **Schema minimum value**: Changed from `min: 100` to `min: 1000`
- **Counter default**: Changed from `default: 99` to `default: 999`
- **Initialization logic**: Updated to ensure counter starts from 999 (so next EFT will be 1000)

### 2. Commission Trust EFT Updates (`backend/models/CommissionTrustEFT.js`)

- **Schema minimum value**: Changed from `min: 200` to `min: 2000`
- **Counter default**: Changed from `default: 199` to `default: 1999`
- **Initialization logic**: Updated to ensure counter starts from 1999 (so next EFT will be 2000)

### 3. General Account EFT Updates (`backend/models/GeneralAccountEFT.js`)

- **Schema minimum value**: Added `min: 3000`
- **Counter default**: Changed from `default: 2999` to maintain consistency
- **Initialization logic**: Added to ensure counter starts from 2999 (so next EFT will be 3000)

### 4. Standard EFT Updates (`backend/models/EFT.js`)

- **Schema minimum value**: Changed from `min: 300` to `min: 4000`
- **Counter default**: Changed from `default: 300` to `default: 3999`
- **Initialization logic**: Updated to ensure counter starts from 3999 (so next EFT will be 4000)

### 5. Route Updates

- **Real Estate Trust**: Updated reset counter route and added `/migrate-to-1000` endpoint
- **Commission Trust**: Updated reset counter route and added `/migrate-to-2000` endpoint
- **General Account**: Added reset counter route and `/migrate-to-3000` endpoint
- **Standard EFT**: Added reset counter route and `/migrate-to-4000` endpoint
- **All route handlers**: Updated comments to reflect new starting points

## Migration Process

### For New Installations

If you're setting up the system for the first time, no migration is needed. The system will automatically start EFT numbers from the new ranges.

### For Existing Installations

#### Real Estate Trust EFTs

If you have existing Real Estate Trust EFT records with numbers below 1000, use:

```bash
POST /real-estate-trust-eft/migrate-to-1000
```

#### Commission Trust EFTs

If you have existing Commission Trust EFT records with numbers below 2000, use:

```bash
POST /commission-trust-eft/migrate-to-2000
```

#### General Account EFTs

If you have existing General Account EFT records with numbers below 3000, use:

```bash
POST /general-account-eft/migrate-to-3000
```

#### Standard EFTs

If you have existing Standard EFT records with numbers below 4000, use:

```bash
POST /eft/migrate-to-4000
```

These endpoints will:

1. Find all existing EFT records below the new threshold
2. Renumber them sequentially starting from the new starting point
3. Update related ledger entries
4. Set the counter to the appropriate value
5. Return a summary of the migration

### Manual Counter Reset

#### Real Estate Trust

```bash
POST /real-estate-trust-eft/reset-counter
```

This will set the counter to 999, ensuring the next EFT number will be 1000.

#### Commission Trust

```bash
POST /commission-trust-eft/reset-counter
```

This will set the counter to 1999, ensuring the next EFT number will be 2000.

#### General Account

```bash
POST /general-account-eft/reset-counter
```

This will set the counter to 2999, ensuring the next EFT number will be 3000.

#### Standard EFT

```bash
POST /eft/reset-counter
```

This will set the counter to 3999, ensuring the next EFT number will be 4000.

## EFT Number Ranges

| EFT Type              | Range | Starting Number |
| --------------------- | ----- | --------------- |
| **Real Estate Trust** | 1000+ | 1000            |
| **Commission Trust**  | 2000+ | 2000            |
| **General Account**   | 3000+ | 3000            |
| **Standard EFT**      | 4000+ | 4000            |

## Impact on Existing Data

- **Existing EFT numbers below the new thresholds**: Will be automatically migrated
- **Ledger entries**: Will be updated to maintain consistency
- **Frontend components**: No changes required - they work with any EFT number
- **Database integrity**: Maintained through the migration process

## Testing

After migration, verify that:

1. New Real Estate Trust EFT records start from 1000
2. New Commission Trust EFT records start from 2000
3. New General Account EFT records start from 3000
4. New Standard EFT records start from 4000
5. Existing EFT records have been properly renumbered
6. Ledger entries reference the correct EFT numbers
7. All EFT types work correctly

## Rollback

If you need to rollback to the old numbering system:

1. Restore the previous model files
2. Reset the counters to their old values (99, 199, 299, 399)
3. Renumber existing EFT records back to the old ranges

## Notes

- The migration is designed to be safe and non-destructive
- All related data (ledger entries, trade references) are updated automatically
- The system maintains data integrity throughout the process
- No downtime is required for the migration
- All migration endpoints can be run independently
- The new numbering system provides clear separation between EFT types
