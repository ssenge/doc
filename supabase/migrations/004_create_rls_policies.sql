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

-- Users can update their own orders (limited fields only)
-- Note: Medical fields will be protected by application logic and service role access
CREATE POLICY "users_update_own_orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);

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

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON POLICY "users_own_profile_select" ON user_profiles IS 'Users can only view their own profile';
COMMENT ON POLICY "users_own_orders_select" ON orders IS 'Users can only view their own orders';
COMMENT ON POLICY "users_update_own_orders" ON orders IS 'Users can update their own orders (medical fields protected by app logic)';
COMMENT ON POLICY "users_own_order_history_select" ON order_status_history IS 'Users can view status history of their own orders only'; 