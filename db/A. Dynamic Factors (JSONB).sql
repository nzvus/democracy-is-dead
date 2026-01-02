-- Enable flexible factor configuration
ALTER TABLE factors 
ADD COLUMN config JSONB DEFAULT '{}'::jsonb, -- Stores min/max, steps
ADD COLUMN is_hidden BOOLEAN DEFAULT false,  -- For "Blind" factors
ADD COLUMN type TEXT DEFAULT 'numerical';    -- 'numerical' | 'constant'

-- Allow candidates to have fixed values for "Constant" factors (e.g., Price)
ALTER TABLE candidates
ADD COLUMN static_values JSONB DEFAULT '{}'::jsonb;