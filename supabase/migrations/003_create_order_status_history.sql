-- Migration: Create order_status_history table
-- Description: Track all status changes for orders (audit trail)

CREATE TABLE order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE,
  
  -- Status Change Details
  status_type text NOT NULL CHECK (status_type IN ('rx_status', 'shipping_status')),
  old_status text,
  new_status text NOT NULL,
  notes text,
  
  -- Who Made the Change
  changed_by text, -- Simple name (doctor, admin, system)
  changed_by_role text CHECK (changed_by_role IN ('patient', 'doctor', 'admin', 'system')),
  
  -- Timestamp
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Add indexes for performance
CREATE INDEX idx_order_status_history_order_id ON order_status_history USING btree (order_id);
CREATE INDEX idx_order_status_history_status_type ON order_status_history USING btree (status_type);
CREATE INDEX idx_order_status_history_created_at ON order_status_history USING btree (created_at DESC);
CREATE INDEX idx_order_status_history_changed_by_role ON order_status_history USING btree (changed_by_role);

-- Composite index for common queries
CREATE INDEX idx_order_status_history_order_status_type ON order_status_history USING btree (order_id, status_type, created_at DESC);

-- Add comments for documentation
COMMENT ON TABLE order_status_history IS 'Audit trail of all status changes for orders';
COMMENT ON COLUMN order_status_history.status_type IS 'Which status field changed (rx_status or shipping_status)';
COMMENT ON COLUMN order_status_history.old_status IS 'Previous status value (null for initial status)';
COMMENT ON COLUMN order_status_history.new_status IS 'New status value';
COMMENT ON COLUMN order_status_history.changed_by IS 'Name of person who made the change';
COMMENT ON COLUMN order_status_history.changed_by_role IS 'Role of person who made the change';

-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Log rx_status changes
  IF OLD.rx_status IS DISTINCT FROM NEW.rx_status THEN
    INSERT INTO order_status_history (
      order_id, 
      status_type, 
      old_status, 
      new_status, 
      notes,
      changed_by,
      changed_by_role
    ) VALUES (
      NEW.id,
      'rx_status',
      OLD.rx_status,
      NEW.rx_status,
      CASE 
        WHEN NEW.rx_status = 'approved' THEN NEW.approval_notes
        WHEN NEW.rx_status = 'rejected' THEN NEW.rejection_reason
        ELSE NULL
      END,
      NEW.reviewed_by,
      'doctor'
    );
  END IF;
  
  -- Log shipping_status changes
  IF OLD.shipping_status IS DISTINCT FROM NEW.shipping_status THEN
    INSERT INTO order_status_history (
      order_id,
      status_type,
      old_status,
      new_status,
      notes,
      changed_by,
      changed_by_role
    ) VALUES (
      NEW.id,
      'shipping_status',
      OLD.shipping_status,
      NEW.shipping_status,
      NEW.shipping_notes,
      NEW.shipped_by,
      'admin'
    );
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically log status changes
CREATE TRIGGER log_order_status_changes
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_order_status_change();

-- Function to log initial order creation
CREATE OR REPLACE FUNCTION log_initial_order_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Log initial rx_status
  INSERT INTO order_status_history (
    order_id,
    status_type,
    old_status,
    new_status,
    notes,
    changed_by,
    changed_by_role
  ) VALUES (
    NEW.id,
    'rx_status',
    NULL,
    NEW.rx_status,
    'Order created',
    'system',
    'system'
  );
  
  -- Log initial shipping_status
  INSERT INTO order_status_history (
    order_id,
    status_type,
    old_status,
    new_status,
    notes,
    changed_by,
    changed_by_role
  ) VALUES (
    NEW.id,
    'shipping_status',
    NULL,
    NEW.shipping_status,
    'Order created',
    'system',
    'system'
  );
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for initial status logging
CREATE TRIGGER log_initial_order_status
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION log_initial_order_status(); 