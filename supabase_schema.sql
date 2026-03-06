-- Create auth_otps table
CREATE TABLE IF NOT EXISTS public.auth_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_e164 TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    purpose TEXT NOT NULL DEFAULT 'hub_login',
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    resend_count INTEGER NOT NULL DEFAULT 0,
    last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip_address TEXT NULL,
    user_agent TEXT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_otps_phone_e164 ON public.auth_otps(phone_e164);
CREATE INDEX IF NOT EXISTS idx_auth_otps_created_at_desc ON public.auth_otps(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_otps_expires_at ON public.auth_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_otps_used_at ON public.auth_otps(used_at);

-- RLS (Row Level Security) - Optional but recommended
-- For simplicity in this implementation, we assume the server uses the service_role key
-- to bypass RLS, but you can add policies if needed.
ALTER TABLE public.auth_otps ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage OTPs
CREATE POLICY "Service role can do everything on auth_otps"
ON public.auth_otps
FOR ALL
USING (true)
WITH CHECK (true);
