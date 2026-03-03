-- EasySplit Table Schemas
CREATE TABLE IF NOT EXISTS public.categories (id uuid, icon text, primary_color text, name text, user_id uuid, sort_order integer, created_at timestamp with time zone);
CREATE TABLE IF NOT EXISTS public.personnel (sort_order integer, created_at timestamp with time zone, name text, linked_user_id uuid, user_id uuid, project_id uuid, id uuid);
CREATE TABLE IF NOT EXISTS public.profiles (id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, name text, email text, avatar_url text);
CREATE TABLE IF NOT EXISTS public.project_members (joined_at timestamp with time zone, role text, id uuid, user_id uuid, project_id uuid);
CREATE TABLE IF NOT EXISTS public.project_settlements (from_personnel_id uuid, id uuid, project_id uuid, to_personnel_id uuid, amount numeric, is_cleared boolean, created_at timestamp with time zone, remark text);
CREATE TABLE IF NOT EXISTS public.projects (name text, invite_code text, created_at timestamp with time zone, status text, user_id uuid, id uuid);
CREATE TABLE IF NOT EXISTS public.transaction_participants (personnel_id uuid, user_id uuid, id uuid, created_at timestamp with time zone, transaction_id uuid);
CREATE TABLE IF NOT EXISTS public.transactions (created_at timestamp with time zone, amount numeric, date date, title text, category_id uuid, debtor_id uuid, id uuid, project_id uuid, user_id uuid, created_by uuid, payer_id uuid, description text, type text);
CREATE TABLE IF NOT EXISTS public.user_settings (updated_at timestamp with time zone, id uuid, key text, value text, user_id uuid);