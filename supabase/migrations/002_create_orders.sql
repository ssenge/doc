-- Migration: Create orders table
-- Description: Main orders table with AI/rule decision support and split status

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id text, -- From current TRT data collection system
  email text, -- For guest orders (before account creation)
  
  -- Order Details
  treatment_type text,
  treatment_name text,
  price decimal(10,2),
  currency text DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'GBP')),
  
  -- Assessment Data (JSON from current system)
  assessment_data jsonb,
  consultation_type text,
  
  -- Payment Information
  stripe_session_id text,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  
  -- SPLIT STATUS FIELDS
  rx_status text DEFAULT 'pending' CHECK (rx_status IN ('pending', 'approved', 'rejected')),
  shipping_status text DEFAULT 'not_ready' CHECK (shipping_status IN ('not_ready', 'ready', 'shipped', 'delivered')),
  
  -- Shipping Address (can override billing address)
  shipping_street text, -- "Alexanderplatz 1"
  shipping_street2 text, -- "Office Building, 3rd Floor"
  shipping_postal_code text,
  shipping_city text,
  shipping_country text,
  tracking_number text,
  
  -- AI/RULE-BASED DECISION SUPPORT COLUMNS
  rule_decision text CHECK (rule_decision IN ('approve', 'reject', 'review_required', 'insufficient_data')),
  rule_reason text,
  rule_processed_at timestamp with time zone,
  
  ai_decision text CHECK (ai_decision IN ('approve', 'reject', 'review_required', 'uncertain')),
  ai_reason text,
  ai_confidence_score decimal(3,2) CHECK (ai_confidence_score >= 0.0 AND ai_confidence_score <= 1.0),
  ai_processed_at timestamp with time zone,
  
  -- DOCTOR APPROVAL FIELDS
  reviewed_by text, -- Doctor name (simple text)
  reviewed_at timestamp with time zone,
  approval_notes text,
  rejection_reason text,
  prescription_details jsonb, -- Drug details, dosage, etc.
  medical_notes text,
  doctor_agrees_with_ai boolean, -- Track agreement for learning
  doctor_agrees_with_rules boolean, -- Track agreement for learning
  
  -- SHIPPING FIELDS
  shipped_by text, -- Admin/fulfillment person name
  shipped_at timestamp with time zone,
  shipping_notes text,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_orders_user_id ON orders USING btree (user_id);
CREATE INDEX idx_orders_email ON orders USING btree (email);
CREATE INDEX idx_orders_session_id ON orders USING btree (session_id);
CREATE INDEX idx_orders_rx_status ON orders USING btree (rx_status);
CREATE INDEX idx_orders_shipping_status ON orders USING btree (shipping_status);
CREATE INDEX idx_orders_created_at ON orders USING btree (created_at DESC);
CREATE INDEX idx_orders_stripe_session ON orders USING btree (stripe_session_id);

-- Indexes for AI/Rule analysis
CREATE INDEX idx_orders_rule_decision ON orders USING btree (rule_decision);
CREATE INDEX idx_orders_ai_decision ON orders USING btree (ai_decision);
CREATE INDEX idx_orders_ai_confidence ON orders USING btree (ai_confidence_score);

-- Add comments for documentation
COMMENT ON TABLE orders IS 'Main orders table with AI/rule decision support and split status tracking';
COMMENT ON COLUMN orders.rx_status IS 'Prescription approval status (doctor workflow)';
COMMENT ON COLUMN orders.shipping_status IS 'Shipping/fulfillment status (admin workflow)';
COMMENT ON COLUMN orders.rule_decision IS 'Rule-based analysis recommendation';
COMMENT ON COLUMN orders.ai_decision IS 'AI analysis recommendation';
COMMENT ON COLUMN orders.ai_confidence_score IS 'AI confidence level (0.0 to 1.0)';
COMMENT ON COLUMN orders.assessment_data IS 'Patient assessment data from TRT forms (JSON)';
COMMENT ON COLUMN orders.prescription_details IS 'Prescription details if approved (JSON)'; 