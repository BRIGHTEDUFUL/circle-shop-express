CREATE TABLE public.categories (
  id text PRIMARY KEY,
  name text NOT NULL,
  short_name text NOT NULL,
  image_key text NOT NULL DEFAULT 'desk',
  sort_order integer NOT NULL DEFAULT 0,
  visible boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY categories_read ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY categories_staff ON public.categories FOR ALL TO authenticated USING (public.is_staff()) WITH CHECK (public.is_staff());
INSERT INTO public.categories (id,name,short_name,image_key,sort_order) VALUES
 ('desks','Gaming & office desks','Desks','desk',1),
 ('chairs','Office chairs','Chairs','chair',2),
 ('accessories','Computer accessories','Accessories','keyboard',3),
 ('mounts','Stands & mounts','Stands & mounts','arm',4),
 ('audio','Streaming & audio','Streaming & audio','mic',5);
ALTER TABLE public.store_settings
  ADD COLUMN hero_image text NOT NULL DEFAULT 'workspace',
  ADD COLUMN setup_image text NOT NULL DEFAULT 'workspace',
  ADD COLUMN announcement text NOT NULL DEFAULT 'Circle, Accra · Pickup in store · Delivery across Ghana',
  ADD COLUMN whatsapp text NOT NULL DEFAULT '',
  ADD COLUMN featured_ids text[] NOT NULL DEFAULT '{standing-desk,ergonomic-chair,mechanical-keyboard}';