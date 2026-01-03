-- Add plan columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS razorpay_payment_id TEXT;

-- Create index for plan queries
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON public.profiles(plan);