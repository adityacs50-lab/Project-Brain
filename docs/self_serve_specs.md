# 🛠️ StateLock Self-Serve Onboarding: Technical Specifications (Phase 2)

This document outlines the database schema, signup validation, and secure API key generation/storage algorithms required to build the frictionless self-serve path.

---

## 1. Signup Flow & Validation Schemas

To ensure zero friction, the signup form asks for only three fields: **Email**, **Password**, and **Project Name**. 

### A. Frontend Form Validation (TypeScript / Zod)
```typescript
import { z } from 'zod';

export const developerSignupSchema = z.object({
  email: z
    .string()
    .email({ message: "Please provide a valid developer email." })
    .min(5)
    .max(100),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  projectName: z
    .string()
    .min(2, { message: "Project or company name must be at least 2 characters." })
    .max(50)
});

type DeveloperSignupInput = z.infer<typeof developerSignupSchema>;
```

### B. Backend Request Validation (Python / Pydantic)
```python
from pydantic import BaseModel, EmailStr, Field

class DeveloperSignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    project_name: str = Field(..., min_length=2, max_length=50)
```

---

## 2. Database Schema (PostgreSQL & Supabase)

We introduce a `developer_accounts` table to link users to workspaces, and store **hashed** API keys to prevent plain-text leakages in case of database breaches.

```sql
-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Developer Accounts Table
CREATE TABLE developer_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    project_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hashed API Keys Table (Ensures security against DB leaks)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    developer_id UUID NOT NULL REFERENCES developer_accounts(id) ON DELETE CASCADE,
    workspace_id VARCHAR(100) NOT NULL,
    key_prefix VARCHAR(10) NOT NULL, -- e.g., "sl_live_" or "sl_test_"
    hashed_key VARCHAR(64) UNIQUE NOT NULL, -- SHA-256 hash of the full key
    name VARCHAR(50) DEFAULT 'Default Key',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP WITH TIME ZONE
);

-- Indexing for fast authentication lookup
CREATE INDEX idx_api_keys_hashed ON api_keys(hashed_key) WHERE is_active = TRUE;
```

---

## 3. Cryptographically Secure API Key Generation & Storage

StateLock generates a high-entropy API key with a prefix (e.g. `sl_live_`) and stores only the SHA-256 hash of the secret portion in the database.

```python
import secrets
import hashlib
from typing import Tuple

def generate_api_key(prefix: str = "sl_live_") -> Tuple[str, str]:
    """
    Generates a high-entropy API key.
    
    Returns:
        Tuple[str, str]: (plain_text_key_to_show_user, hashed_key_for_db_storage)
    """
    # 1. Generate 32 bytes of secure random hex (64 characters of entropy)
    secret_portion = secrets.token_hex(32)
    
    # 2. Construct the full user-facing key
    plain_text_key = f"{prefix}{secret_portion}"
    
    # 3. Hash the key using SHA-256 to store in the database
    hasher = hashlib.sha256()
    hasher.update(plain_text_key.encode('utf-8'))
    hashed_key = hasher.hexdigest()
    
    return plain_text_key, hashed_key

def verify_api_key(incoming_key: str, stored_hashed_key: str) -> bool:
    """
    Verifies an incoming key header against the stored database hash.
    """
    hasher = hashlib.sha256()
    hasher.update(incoming_key.encode('utf-8'))
    incoming_hash = hasher.hexdigest()
    
    # Use hmac.compare_digest to prevent timing attacks
    import hmac
    return hmac.compare_digest(incoming_hash, stored_hashed_key)
```

### Key Presentation Policy (UI Experience)
*   **Show Once:** The plain text key (`sl_live_...`) is shown to the developer in the UI **only once** immediately after signup.
*   **Irretrievable:** Once closed, it can never be retrieved or rendered again (since the database only stores the SHA-256 hash). The developer must generate a new key if they lose it.

---

## 4. Scalable Pricing Anchor Strategy

We align pricing into three clear product-driven tiers to avoid the SaaS "dead zone":

| Tier | Price | Ideal For | Key Features & Value Metric |
| :--- | :--- | :--- | :--- |
| **Self-Serve** | **$500/mo** | Early startups, individual developers | 1 Million runs/mo, Local rule caching (<3ms), Community support. Self-serve dashboard. |
| **Starter** | **$2,500/mo** | Scaling AI teams (<10 agents) | 10 Million runs/mo, Automated Slack/Teams sync, Rule conflict detection, Dedicated dev support. |
| **Enterprise** | **$10,000+/mo** | Enterprises, high-risk compliance | Unlimited runs, Air-gapped Helm Charts, Private VPC, SSO/SAML, Zero-Retention logs (SOC2/HIPAA). |
