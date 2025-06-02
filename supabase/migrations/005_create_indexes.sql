-- Migration: Create additional indexes and optimizations
-- Description: Performance indexes for common queries and analytics

-- =====================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- =====================================================

-- Doctor workflow: Find pending orders with assessment data
CREATE INDEX idx_orders_doctor_workflow ON orders USING btree (rx_status, created_at DESC) 
  WHERE rx_status = 'pending';

-- Admin workflow: Find orders ready for shipping
CREATE INDEX idx_orders_shipping_workflow ON orders USING btree (shipping_status, rx_status, created_at DESC)
  WHERE shipping_status = 'ready' AND rx_status = 'approved';

-- Patient dashboard: User's orders sorted by date
CREATE INDEX idx_orders_patient_dashboard ON orders USING btree (user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Guest order lookup by email and session
CREATE INDEX idx_orders_guest_lookup ON orders USING btree (email, session_id, created_at DESC)
  WHERE user_id IS NULL;

-- =====================================================
-- ANALYTICS AND REPORTING INDEXES
-- =====================================================

-- AI/Rule performance analysis
CREATE INDEX idx_orders_ai_analysis ON orders USING btree (ai_decision, rule_decision, rx_status)
  WHERE ai_decision IS NOT NULL AND rule_decision IS NOT NULL;

-- Doctor agreement tracking
CREATE INDEX idx_orders_doctor_agreement ON orders USING btree (doctor_agrees_with_ai, doctor_agrees_with_rules, reviewed_at)
  WHERE reviewed_at IS NOT NULL;

-- Treatment type analysis
CREATE INDEX idx_orders_treatment_analysis ON orders USING btree (treatment_type, rx_status, created_at);

-- Payment status tracking
CREATE INDEX idx_orders_payment_tracking ON orders USING btree (payment_status, stripe_session_id, created_at);

-- =====================================================
-- JSONB INDEXES FOR ASSESSMENT DATA
-- =====================================================

-- Index for common assessment data queries
CREATE INDEX idx_orders_assessment_age ON orders USING gin ((assessment_data->'age'));
CREATE INDEX idx_orders_assessment_symptoms ON orders USING gin ((assessment_data->'symptoms'));
CREATE INDEX idx_orders_assessment_medical_history ON orders USING gin ((assessment_data->'medicalHistory'));

-- Index for prescription details
CREATE INDEX idx_orders_prescription_details ON orders USING gin (prescription_details)
  WHERE prescription_details IS NOT NULL;

-- =====================================================
-- PARTIAL INDEXES FOR SPECIFIC WORKFLOWS
-- =====================================================

-- Active orders (not delivered or rejected)
CREATE INDEX idx_orders_active ON orders USING btree (created_at DESC)
  WHERE rx_status != 'rejected' AND shipping_status != 'delivered';

-- Failed payments needing attention
CREATE INDEX idx_orders_failed_payments ON orders USING btree (created_at DESC)
  WHERE payment_status = 'failed';

-- Orders with AI uncertainty (for review)
CREATE INDEX idx_orders_ai_uncertain ON orders USING btree (ai_confidence_score, created_at)
  WHERE ai_decision = 'uncertain' OR ai_confidence_score < 0.7;

-- =====================================================
-- TEXT SEARCH INDEXES
-- =====================================================

-- Full-text search on approval notes and rejection reasons
CREATE INDEX idx_orders_approval_text_search ON orders USING gin (
  to_tsvector('english', coalesce(approval_notes, '') || ' ' || coalesce(rejection_reason, ''))
);

-- Full-text search on medical notes
CREATE INDEX idx_orders_medical_notes_search ON orders USING gin (
  to_tsvector('english', coalesce(medical_notes, ''))
);

-- =====================================================
-- ADDRESS INDEXES FOR SHIPPING
-- =====================================================

-- Shipping address lookup (for logistics)
CREATE INDEX idx_orders_shipping_location ON orders USING btree (shipping_country, shipping_city, shipping_postal_code)
  WHERE shipping_status IN ('ready', 'shipped');

-- Billing address from user profiles (for reporting)
CREATE INDEX idx_user_profiles_billing_location ON user_profiles USING btree (billing_country, billing_city);

-- =====================================================
-- TIME-BASED INDEXES FOR PERFORMANCE
-- =====================================================

-- Processing time analysis
CREATE INDEX idx_orders_processing_time ON orders USING btree (created_at, reviewed_at)
  WHERE reviewed_at IS NOT NULL;

-- Shipping time analysis
CREATE INDEX idx_orders_shipping_time ON orders USING btree (reviewed_at, shipped_at)
  WHERE shipped_at IS NOT NULL;

-- =====================================================
-- UNIQUE CONSTRAINTS FOR DATA INTEGRITY
-- =====================================================

-- Ensure unique Stripe session IDs
CREATE UNIQUE INDEX idx_orders_unique_stripe_session ON orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

-- Ensure unique session IDs from TRT system
CREATE UNIQUE INDEX idx_orders_unique_trt_session ON orders (session_id)
  WHERE session_id IS NOT NULL;

-- =====================================================
-- STATISTICS AND MAINTENANCE
-- =====================================================

-- Update table statistics for better query planning
ANALYZE user_profiles;
ANALYZE orders;
ANALYZE order_status_history;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON INDEX idx_orders_doctor_workflow IS 'Optimizes doctor workflow queries for pending orders';
COMMENT ON INDEX idx_orders_shipping_workflow IS 'Optimizes admin shipping workflow queries';
COMMENT ON INDEX idx_orders_patient_dashboard IS 'Optimizes patient dashboard order history';
COMMENT ON INDEX idx_orders_ai_analysis IS 'Supports AI/rule performance analysis queries';
COMMENT ON INDEX idx_orders_assessment_age IS 'Enables fast queries on patient age from assessment data';
COMMENT ON INDEX idx_orders_active IS 'Partial index for active orders only';
COMMENT ON INDEX idx_orders_approval_text_search IS 'Full-text search on approval/rejection notes'; 