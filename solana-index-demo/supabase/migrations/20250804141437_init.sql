
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_address VARCHAR(44) NOT NULL,
    referred_address VARCHAR(44) NOT NULL UNIQUE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_address);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_address);
CREATE INDEX IF NOT EXISTS idx_referrals_timestamp ON referrals(timestamp);

CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    wallet_address VARCHAR(44) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waitlist_address ON waitlist(wallet_address);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);


ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on referrals" ON referrals
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on referrals" ON referrals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on waitlist" ON waitlist
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access on waitlist" ON waitlist
    FOR INSERT WITH CHECK (true);

CREATE OR REPLACE VIEW referral_leaderboard AS
SELECT 
    referrer_address,
    COUNT(*) as referral_count,
    MIN(timestamp) as first_referral,
    MAX(timestamp) as latest_referral
FROM referrals 
GROUP BY referrer_address 
ORDER BY referral_count DESC, first_referral ASC;

GRANT SELECT ON referral_leaderboard TO anon, authenticated;