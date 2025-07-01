-- Database Schema untuk Facebook Login
-- Jalankan query ini di Supabase SQL Editor

-- Tabel users dengan support Facebook
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR UNIQUE,
  phone VARCHAR UNIQUE,
  name VARCHAR,
  role VARCHAR DEFAULT 'user',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  
  -- Facebook fields
  facebook_id VARCHAR UNIQUE,
  profile_picture VARCHAR,
  gender VARCHAR,
  birthday DATE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index untuk Facebook ID
CREATE INDEX IF NOT EXISTS idx_users_facebook_id ON users(facebook_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy untuk users
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id); 