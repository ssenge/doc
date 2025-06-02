-- Migration: Create Row Level Security policies
-- Description: Security policies to protect user data and control access

-- =====================================================
-- USER PROFILES POLICIES
-- =====================================================

-- Users can view and update their own profile
CREATE POLICY "users_own_profile_select" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_own_profile_update" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "users_own_profile_insert" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "users_own_profile_delete" ON user_profiles
  FOR DELETE USING (auth.uid() = id);

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Users can view their own orders
CREATE POLICY "users_own_orders_select" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert orders (during checkout)
CREATE POLICY "users_create_orders" ON orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL) -- Allow guest orders
  );

-- Users can update their own shipping address only (not medical fields)
CREATE POLICY "users_update_shipping_address" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Ensure medical/approval fields cannot be changed by patients
    OLD.rx_status = NEW.rx_status AND
    OLD.reviewed_by = NEW.reviewed_by AND
    OLD.reviewed_at = NEW.reviewed_at AND
    OLD.approval_notes = NEW.approval_notes AND
    OLD.rejection_reason = NEW.rejection_reason AND
    OLD.prescription_details = NEW.prescription_details AND
    OLD.medical_notes = NEW.medical_notes AND
    OLD.doctor_agrees_with_ai = NEW.doctor_agrees_with_ai AND
    OLD.doctor_agrees_with_rules = NEW.doctor_agrees_with_rules AND
    -- AI/Rule fields also protected
    OLD.rule_decision = NEW.rule_decision AND
    OLD.rule_reason = NEW.rule_reason AND
    OLD.ai_decision = NEW.ai_decision AND
    OLD.ai_reason = NEW.ai_reason AND
    OLD.ai_confidence_score = NEW.ai_confidence_score
  );

-- =====================================================
-- ORDER STATUS HISTORY POLICIES
-- =====================================================

-- Users can view status history of their own orders
CREATE POLICY "users_own_order_history_select" ON order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_status_history.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Only system can insert status history (via triggers)
CREATE POLICY "system_insert_status_history" ON order_status_history
  FOR INSERT WITH CHECK (true); -- Controlled by triggers

-- =====================================================
-- ADMIN/DOCTOR ACCESS (Service Role)
-- =====================================================

-- Note: Admin and doctor access will be handled via service role key
-- in the admin interface, bypassing RLS policies

-- =====================================================
-- HELPER FUNCTIONS FOR POLICIES
-- =====================================================

-- Function to check if user is admin (for future use)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  -- This can be enhanced later with proper role checking
  -- For now, admin access is handled via service role
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is doctor (for future use)
CREATE OR REPLACE FUNCTION is_doctor()
RETURNS boolean AS $$
BEGIN
  -- This can be enhanced later with proper role checking
  -- For now, doctor access is handled via service role
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ADDITIONAL SECURITY MEASURES
-- =====================================================

-- Prevent users from accessing other users' data via email
CREATE POLICY "prevent_email_enumeration" ON orders
  FOR SELECT USING (
    auth.uid() = user_id OR 
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Ensure users cannot modify order IDs or critical system fields
CREATE POLICY "protect_system_fields" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (
    OLD.id = NEW.id AND
    OLD.created_at = NEW.created_at AND
    OLD.session_id = NEW.session_id AND
    OLD.stripe_session_id = NEW.stripe_session_id
  );

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "users_own_profile_select" ON user_profiles IS 'Users can only view their own profile';
COMMENT ON POLICY "users_own_orders_select" ON orders IS 'Users can only view their own orders';
COMMENT ON POLICY "users_update_shipping_address" ON orders IS 'Users can only update shipping address, not medical fields';
COMMENT ON POLICY "users_own_order_history_select" ON order_status_history IS 'Users can view status history of their own orders only'; 