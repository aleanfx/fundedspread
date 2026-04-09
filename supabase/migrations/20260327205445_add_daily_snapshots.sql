-- Create daily_snapshots table to store end-of-day account equity
CREATE TABLE IF NOT EXISTS public.daily_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mt5_account_id UUID REFERENCES public.mt5_accounts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    equity NUMERIC NOT NULL,
    balance NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(mt5_account_id, date)
);

ALTER TABLE public.daily_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own snapshots" 
ON public.daily_snapshots FOR SELECT 
TO authenticated 
USING (
    mt5_account_id IN (
        SELECT id FROM public.mt5_accounts WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Service role can manage snapshots"
ON public.daily_snapshots
USING (true)
WITH CHECK (true);
