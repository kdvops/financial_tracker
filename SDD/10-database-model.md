# 10 - Database Model

## Tablas principales

## users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

## oauth_connections

```sql
CREATE TABLE oauth_connections (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  provider VARCHAR(50) NOT NULL,
  provider_account_id TEXT,
  access_token_encrypted TEXT NOT NULL,
  refresh_token_encrypted TEXT,
  scopes TEXT[],
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);
```

## raw_messages

```sql
CREATE TABLE raw_messages (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  source VARCHAR(50) NOT NULL,
  provider VARCHAR(100),
  provider_message_id TEXT,
  subject TEXT,
  sender TEXT,
  received_at TIMESTAMP,
  body_hash TEXT NOT NULL,
  normalized_text TEXT,
  processing_status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(user_id, source, provider_message_id)
);
```

## cards

```sql
CREATE TABLE cards (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  bank_name VARCHAR(150),
  display_name VARCHAR(150) NOT NULL,
  card_last4 VARCHAR(4),
  currency VARCHAR(3) NOT NULL DEFAULT 'DOP',
  credit_limit NUMERIC(14,2),
  cutoff_day INT,
  due_day INT,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

## categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT false
);
```

## transactions

```sql
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  card_id UUID REFERENCES cards(id),
  category_id UUID REFERENCES categories(id),
  raw_message_id UUID REFERENCES raw_messages(id),
  type VARCHAR(50) NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  merchant TEXT,
  transaction_date TIMESTAMP NOT NULL,
  source VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  confidence NUMERIC(4,3),
  duplicate_group_id UUID,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

## budgets

```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  amount NUMERIC(14,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'DOP',
  period VARCHAR(20) NOT NULL DEFAULT 'monthly',
  alert_threshold NUMERIC(5,2) NOT NULL DEFAULT 80,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

## alerts

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  transaction_id UUID REFERENCES transactions(id),
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```

## category_rules

```sql
CREATE TABLE category_rules (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  pattern TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id),
  priority INT NOT NULL DEFAULT 100,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
```
