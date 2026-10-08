ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gallery text[] NOT NULL DEFAULT '{}';
CREATE POLICY "product photos staff insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-photos' AND public.is_staff());
CREATE POLICY "product photos staff update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-photos' AND public.is_staff());
CREATE POLICY "product photos staff delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-photos' AND public.is_staff());