# TRT Clinic Database Setup

This directory contains the complete database structure for the TRT Clinic user account system using Supabase.

## 🏗️ Database Architecture

### Tables Overview

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `user_profiles` | User information & billing addresses | European address format, multi-language support |
| `orders` | Main orders with AI/rule support | Split status (rx/shipping), decision support columns |
| `order_status_history` | Audit trail of all changes | Automatic logging, complete history |

### Status Flow

```
Rx Status:     pending → approved/rejected
Shipping:      not_ready → ready → shipped → delivered
```

## 🚀 Quick Start

### Prerequisites
- Node.js and npm installed
- Supabase account and project created

### Setup Database

```bash
# Run the complete setup (recommended)
./database/scripts/setup.sh
```

This script will:
1. Install Supabase CLI if needed
2. Login to Supabase
3. Link to your project
4. Apply all migrations
5. Set up complete database structure

### Reset Database (Development)

```bash
# Reset and recreate everything (WARNING: deletes all data)
./database/scripts/reset.sh
```

## 📁 File Structure

```
database/
├── migrations/           # SQL migration files (run in order)
│   ├── 001_create_user_profiles.sql
│   ├── 002_create_orders.sql
│   ├── 003_create_order_status_history.sql
│   ├── 004_create_rls_policies.sql
│   └── 005_create_indexes.sql
├── scripts/             # Automation scripts
│   ├── setup.sh        # Complete database setup
│   └── reset.sh        # Reset database (dev only)
└── README.md           # This file
```

## 📊 Database Schema

### user_profiles
```sql
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  first_name text,
  last_name text,
  language text DEFAULT 'en',
  
  -- Billing Address (German/European format)
  billing_street text,        -- "Unter den Linden 77"
  billing_street2 text,       -- "Apartment 4B"
  billing_postal_code text,   -- "10117"
  billing_city text,          -- "Berlin"
  billing_country text DEFAULT 'Germany',
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### orders (Main Table)
```sql
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  session_id text,  -- From TRT data collection
  email text,       -- For guest orders
  
  -- Order Details
  treatment_type text,
  treatment_name text,
  price decimal(10,2),
  currency text DEFAULT 'EUR',
  assessment_data jsonb,  -- Patient assessment from forms
  consultation_type text,
  
  -- Payment Info
  stripe_session_id text,
  payment_status text DEFAULT 'pending',
  payment_method text,
  
  -- SPLIT STATUS SYSTEM
  rx_status text DEFAULT 'pending',           -- Doctor workflow
  shipping_status text DEFAULT 'not_ready',   -- Admin workflow
  
  -- Shipping Address (optional override)
  shipping_street text,
  shipping_street2 text,
  shipping_postal_code text,
  shipping_city text,
  shipping_country text,
  tracking_number text,
  
  -- AI/RULE DECISION SUPPORT (for future)
  rule_decision text,      -- 'approve', 'reject', 'review_required'
  rule_reason text,
  rule_processed_at timestamp,
  ai_decision text,        -- 'approve', 'reject', 'uncertain'
  ai_reason text,
  ai_confidence_score decimal(3,2),  -- 0.0 to 1.0
  ai_processed_at timestamp,
  
  -- DOCTOR APPROVAL FIELDS
  reviewed_by text,        -- Doctor name
  reviewed_at timestamp,
  approval_notes text,
  rejection_reason text,
  prescription_details jsonb,
  medical_notes text,
  doctor_agrees_with_ai boolean,     -- Learning data
  doctor_agrees_with_rules boolean,  -- Learning data
  
  -- SHIPPING FIELDS
  shipped_by text,         -- Admin name
  shipped_at timestamp,
  shipping_notes text,
  
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);
```

### order_status_history (Audit Trail)
```sql
CREATE TABLE order_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  
  status_type text,  -- 'rx_status' or 'shipping_status'
  old_status text,
  new_status text,
  notes text,
  
  changed_by text,
  changed_by_role text,  -- 'doctor', 'admin', 'system'
  
  created_at timestamp DEFAULT now()
);
```

## 🔒 Security Features

### Row Level Security (RLS)
- **Users see only their own data**
- **Patients cannot modify medical fields**
- **Admin access via service role key**
- **Automatic audit logging**

### Key Policies
```sql
-- Users can only view their own orders
CREATE POLICY "users_own_orders_select" ON orders
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update shipping address only
CREATE POLICY "users_update_shipping_address" ON orders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (/* medical fields protected */);
```

## 🔄 Workflows

### Doctor Approval Workflow
1. **Login to Supabase Dashboard**
2. **Go to Table Editor → orders**
3. **Filter by `rx_status = 'pending'`**
4. **Review `assessment_data` (JSON)**
5. **Update fields:**
   - `rx_status` → 'approved' or 'rejected'
   - `reviewed_by` → Doctor name
   - `reviewed_at` → Current timestamp
   - `approval_notes` or `rejection_reason`
6. **Patient sees real-time update**

### Admin Shipping Workflow
1. **Filter by `shipping_status = 'ready'`**
2. **Process shipment**
3. **Update fields:**
   - `shipping_status` → 'shipped'
   - `shipped_by` → Admin name
   - `tracking_number` → Tracking info
4. **Customer gets tracking update**

### Patient Experience
```
Order Dashboard:
├── Prescription: ⏳ Awaiting doctor review
├── Shipping: ⏸️ Waiting for prescription approval
└── Order Date: January 15, 2024

After Approval:
├── Prescription: ✅ Approved by Dr. Smith
├── Shipping: 📦 Shipped - Track: DHL123456
└── Order Date: January 15, 2024
```

## 🚀 Performance Features

### Optimized Indexes
- **Doctor workflow**: Fast pending order queries
- **Patient dashboard**: Efficient order history
- **Analytics**: AI/rule performance tracking
- **Search**: Full-text search on medical notes
- **JSONB**: Fast assessment data queries

### Automatic Features
- **Status logging**: All changes tracked automatically
- **Updated timestamps**: Auto-updated on changes
- **Unique constraints**: Prevent duplicate sessions
- **Data integrity**: Foreign key constraints

## 🔮 Future Enhancements Ready

### AI/Rule Decision Support
The database is ready for:
- **Rule-based analysis** of assessment data
- **AI recommendations** with confidence scores
- **Doctor agreement tracking** for learning
- **Performance analytics** for model improvement

### Columns Ready for AI:
```sql
rule_decision text,           -- Rule recommendation
rule_reason text,             -- Why rule decided this
ai_decision text,             -- AI recommendation  
ai_reason text,               -- AI explanation
ai_confidence_score decimal,  -- How confident AI is
doctor_agrees_with_ai boolean -- Did doctor follow AI?
```

## 📈 Analytics Queries

### Doctor Performance
```sql
-- How often doctors agree with AI recommendations
SELECT 
  AVG(CASE WHEN doctor_agrees_with_ai THEN 1 ELSE 0 END) as ai_agreement_rate,
  COUNT(*) as total_reviews
FROM orders 
WHERE reviewed_at IS NOT NULL;
```

### Processing Times
```sql
-- Average time from order to approval
SELECT 
  AVG(reviewed_at - created_at) as avg_review_time
FROM orders 
WHERE reviewed_at IS NOT NULL;
```

### Treatment Analysis
```sql
-- Approval rates by treatment type
SELECT 
  treatment_type,
  COUNT(*) as total_orders,
  SUM(CASE WHEN rx_status = 'approved' THEN 1 ELSE 0 END) as approved,
  ROUND(100.0 * SUM(CASE WHEN rx_status = 'approved' THEN 1 ELSE 0 END) / COUNT(*), 2) as approval_rate
FROM orders 
WHERE rx_status IN ('approved', 'rejected')
GROUP BY treatment_type;
```

## 🛠️ Manual Setup (Alternative)

If you prefer manual setup:

1. **Create Supabase project**
2. **Install Supabase CLI**: `npm install -g supabase`
3. **Login**: `supabase login`
4. **Link project**: `supabase link --project-ref YOUR_PROJECT_REF`
5. **Apply migrations**: `supabase db push`

## 🆘 Troubleshooting

### Common Issues

**"Project not linked"**
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

**"Permission denied"**
```bash
chmod +x database/scripts/setup.sh
```

**"Migration failed"**
- Check Supabase dashboard for error details
- Ensure you have admin permissions
- Try resetting: `./database/scripts/reset.sh`

### Getting Help

1. **Check Supabase logs** in dashboard
2. **Verify RLS policies** are not blocking operations
3. **Test with service role key** for admin operations
4. **Check network connectivity** to Supabase

## 📝 Notes

- **Empty by default**: No seed data, starts clean
- **Production ready**: Secure RLS policies included
- **Scalable**: Optimized indexes for performance
- **Auditable**: Complete change history
- **Future-proof**: Ready for AI enhancements

---

**Your TRT Clinic database is ready for production! 🏥** 