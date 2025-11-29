-- Users Table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar TEXT DEFAULT '👤',
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments Table
CREATE TABLE investments (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock_name TEXT,
  current_price DECIMAL(15,2) DEFAULT 0,
  interest_rate DECIMAL(5,2),
  tenure_years DECIMAL(5,2),
  purchase_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions Table
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  investment_id TEXT REFERENCES investments(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  price DECIMAL(15,2) NOT NULL,
  units DECIMAL(15,6) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_transactions_investment_id ON transactions(investment_id);
CREATE INDEX idx_transactions_date ON transactions(date);

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can read all users (for family member list)
CREATE POLICY "Users can view all family members"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (id = current_setting('app.user_id', true)::TEXT);

-- Users can view all investments
CREATE POLICY "Users can view all investments"
  ON investments FOR SELECT
  USING (true);

-- Users can insert/update/delete any investment (family shared)
CREATE POLICY "Users can manage investments"
  ON investments FOR ALL
  USING (true);

-- Users can view all transactions
CREATE POLICY "Users can view all transactions"
  ON transactions FOR SELECT
  USING (true);

-- Users can manage all transactions
CREATE POLICY "Users can manage transactions"
  ON transactions FOR ALL
  USING (true);
