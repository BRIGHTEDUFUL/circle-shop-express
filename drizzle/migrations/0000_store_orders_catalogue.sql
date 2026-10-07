CREATE TABLE public.user_roles(user_id uuid references auth.users(id) on delete cascade primary key, role text not null check(role in ('admin','staff')));
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_role ON public.user_roles FOR SELECT TO authenticated USING(user_id=auth.uid());
CREATE FUNCTION public.is_staff() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=auth.uid() AND role IN ('admin','staff')) $$;
GRANT EXECUTE ON FUNCTION public.is_staff() TO authenticated;
CREATE TABLE public.products(id text primary key,name text not null,brand text not null,category text not null,price numeric not null check(price>=0),original_price numeric,stock integer not null default 0 check(stock>=0),description text not null default '',specs jsonb not null default '{}',image_key text not null,verified boolean not null default false);
GRANT SELECT ON public.products TO anon,authenticated; GRANT INSERT,UPDATE,DELETE ON public.products TO authenticated; GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY catalogue_read ON public.products FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY staff_products ON public.products FOR ALL TO authenticated USING(public.is_staff()) WITH CHECK(public.is_staff());
CREATE TABLE public.store_settings(id integer primary key default 1,hero_title text not null default 'Made for your workspace.',hero_subtitle text not null default 'Desks, chairs and everyday tech. From our Circle shop to your setup.',phone text not null default '+233 24 000 0000',email text not null default 'orders@mbventuresgh.com',address text not null default 'Circle Commercial Area, Accra, Ghana',hours text not null default 'Monday to Saturday, 8:00 AM to 6:00 PM',momo_number text not null default '',momo_name text not null default '',central_fee numeric not null default 30,greater_fee numeric not null default 50,nationwide_fee numeric not null default 100,free_threshold numeric not null default 5000,ordering_enabled boolean not null default false);
GRANT SELECT ON public.store_settings TO anon,authenticated; GRANT UPDATE ON public.store_settings TO authenticated; GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY settings_read ON public.store_settings FOR SELECT TO anon,authenticated USING(true);
CREATE POLICY settings_staff ON public.store_settings FOR UPDATE TO authenticated USING(public.is_staff()) WITH CHECK(public.is_staff());
CREATE TABLE public.orders(id uuid primary key default gen_random_uuid(),reference text unique not null default ('MB-' || upper(encode(gen_random_bytes(8),'hex'))),user_id uuid,customer_name text not null,email text not null,phone text not null,address text not null default '',fulfillment text not null check(fulfillment in ('delivery','pickup')),zone text not null check(zone in ('central','greater','nationwide')),payment_method text not null check(payment_method in ('momo','cod')),provider text,transaction_reference text,payment_status text not null default 'pending' check(payment_status in ('pending','confirmed','rejected')),status text not null default 'received' check(status in ('received','processing','ready','dispatched','completed','cancelled')),subtotal numeric not null,delivery_fee numeric not null,total numeric not null,items jsonb not null,created_at timestamptz not null default now());
GRANT SELECT ON public.orders TO authenticated; GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_read ON public.orders FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.is_staff());
CREATE TABLE public.order_history(id uuid primary key default gen_random_uuid(),order_id uuid references public.orders(id) on delete cascade not null,status text not null,note text not null default '',actor_id uuid,created_at timestamptz not null default now());
GRANT SELECT ON public.order_history TO authenticated; GRANT ALL ON public.order_history TO service_role;
ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY history_read ON public.order_history FOR SELECT TO authenticated USING(public.is_staff() OR EXISTS(SELECT 1 FROM public.orders o WHERE o.id=order_id AND o.user_id=auth.uid()));
CREATE TABLE public.saved_addresses(id uuid primary key default gen_random_uuid(),user_id uuid not null,name text not null,address text not null,phone text not null);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.saved_addresses TO authenticated; GRANT ALL ON public.saved_addresses TO service_role;
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY addresses_owner ON public.saved_addresses FOR ALL TO authenticated USING(user_id=auth.uid()) WITH CHECK(user_id=auth.uid());
INSERT INTO public.store_settings(id) VALUES(1);
INSERT INTO public.products(id,name,brand,category,price,original_price,stock,description,specs,image_key) VALUES
('standing-desk','Electric sit-stand desk','IKEA','desks',2400,null,0,'A height-adjustable desk for seated and standing work. Example catalogue item awaiting store confirmation.','{"Width":"120 cm","Depth":"60 cm","Adjustment":"Electric","Finish":"White / oak"}','desk'),
('gaming-desk','Gaming workstation desk','IKEA','desks',1850,null,0,'A generous desktop for a monitor and peripherals. Example catalogue item awaiting store confirmation.','{"Width":"140 cm","Depth":"80 cm","Finish":"Black"}','gaming'),
('ergonomic-chair','Ergonomic mesh office chair','IKEA','chairs',1650,null,0,'Mesh back and adjustable seating for your desk. Example catalogue item awaiting store confirmation.','{"Back":"Breathable mesh","Armrests":"Adjustable","Base":"Five-star"}','chair'),
('office-chair','High-back office chair','IKEA','chairs',2200,null,0,'High-back office seating. Example catalogue item awaiting store confirmation.','{"Back":"High back","Seat":"Adjustable height","Colour":"Black"}','chair'),
('mechanical-keyboard','MX mechanical wireless keyboard','Logitech','accessories',1299,null,0,'Wireless keyboard for everyday work. Example catalogue item awaiting store confirmation.','{"Connection":"Bluetooth / USB receiver","Layout":"Full size","Power":"Rechargeable"}','keyboard'),
('wireless-mouse','MX Master wireless mouse','Logitech','accessories',850,null,0,'Wireless ergonomic mouse. Example catalogue item awaiting store confirmation.','{"Connection":"Bluetooth / USB receiver","Scroll":"Precision scroll","Power":"Rechargeable"}','mouse'),
('monitor-arm','Adjustable monitor arm','IKEA','mounts',650,null,0,'Adjust your monitor position and reclaim desk space. Example catalogue item awaiting store confirmation.','{"Mount":"Desk clamp","Adjustment":"Height / tilt","Compatibility":"VESA"}','arm'),
('laptop-stand','Laptop support stand','IKEA','mounts',280,null,0,'Raise your laptop above your work surface. Example catalogue item awaiting store confirmation.','{"Material":"Metal","Type":"Desktop stand"}','stand'),
('usb-microphone','Wave USB microphone','Elgato','audio',1450,null,0,'A desktop microphone for calls and recording. Example catalogue item awaiting store confirmation.','{"Connection":"USB","Type":"Condenser","Control":"On-device mute"}','mic'),
('stream-controller','Stream Deck controller','Elgato','audio',1800,null,0,'Programmable keys for your streaming setup. Example catalogue item awaiting store confirmation.','{"Keys":"15 LCD keys","Connection":"USB","Software":"Stream Deck"}','stream');
CREATE FUNCTION public.place_store_order(payload jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE s public.store_settings; p public.products; line jsonb; lines jsonb:='[]'; subtotal numeric:=0; fee numeric:=0; quantity integer; result public.orders;
BEGIN
SELECT * INTO s FROM public.store_settings WHERE id=1;
IF NOT s.ordering_enabled THEN RAISE EXCEPTION 'Ordering is not open yet. Contact the Circle shop.'; END IF;
IF length(trim(payload->>'customer_name'))<2 OR length(payload->>'phone')<9 OR (payload->>'email') NOT LIKE '%@%.%' THEN RAISE EXCEPTION 'Enter your name, phone and email.'; END IF;
IF jsonb_array_length(payload->'items') NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'Your cart is empty or too large.'; END IF;
IF payload->>'fulfillment'='pickup' AND payload->>'payment_method'<>'momo' THEN RAISE EXCEPTION 'Pickup orders require Mobile Money.'; END IF;
IF payload->>'payment_method'='momo' AND (length(s.momo_number)=0 OR length(trim(payload->>'transaction_reference'))<5 OR payload->>'provider' NOT IN ('MTN MoMo','Telecel Cash','AirtelTigo Money')) THEN RAISE EXCEPTION 'Mobile Money details or reference are missing.'; END IF;
IF payload->>'fulfillment'='delivery' AND length(trim(payload->>'address'))<5 THEN RAISE EXCEPTION 'Enter a delivery address.'; END IF;
FOR line IN SELECT value FROM jsonb_array_elements(payload->'items') LOOP
quantity:=(line->>'quantity')::integer;
IF quantity NOT BETWEEN 1 AND 50 THEN RAISE EXCEPTION 'Invalid quantity.'; END IF;
SELECT * INTO p FROM public.products WHERE id=line->>'id' FOR UPDATE;
IF NOT FOUND OR NOT p.verified OR p.stock<quantity THEN RAISE EXCEPTION 'An item is not available. Please check your cart.'; END IF;
subtotal:=subtotal+p.price*quantity;
lines:=lines||jsonb_build_array(jsonb_build_object('id',p.id,'name',p.name,'price',p.price,'quantity',quantity,'image_key',p.image_key));
UPDATE public.products SET stock=stock-quantity WHERE id=p.id;
END LOOP;
IF payload->>'fulfillment'='delivery' AND subtotal<=s.free_threshold THEN
fee:=CASE payload->>'zone' WHEN 'central' THEN s.central_fee WHEN 'greater' THEN s.greater_fee WHEN 'nationwide' THEN s.nationwide_fee ELSE NULL END;
IF fee IS NULL THEN RAISE EXCEPTION 'Choose a delivery area.'; END IF;
END IF;
INSERT INTO public.orders(user_id,customer_name,email,phone,address,fulfillment,zone,payment_method,provider,transaction_reference,subtotal,delivery_fee,total,items) VALUES(auth.uid(),trim(payload->>'customer_name'),payload->>'email',regexp_replace(payload->>'phone','[^0-9+]','','g'),coalesce(payload->>'address',''),payload->>'fulfillment',payload->>'zone',payload->>'payment_method',payload->>'provider',payload->>'transaction_reference',subtotal,fee,subtotal+fee,lines) RETURNING * INTO result;
INSERT INTO public.order_history(order_id,status,note) VALUES(result.id,'received','Order received. Payment awaiting staff confirmation.');
RETURN to_jsonb(result);
END $$;
REVOKE ALL ON FUNCTION public.place_store_order(jsonb) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.place_store_order(jsonb) TO anon,authenticated;
CREATE FUNCTION public.track_store_order(ref text,customer_phone text) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT jsonb_build_object('reference',o.reference,'status',o.status,'payment_status',o.payment_status,'payment_method',o.payment_method,'fulfillment',o.fulfillment,'items',o.items,'subtotal',o.subtotal,'delivery_fee',o.delivery_fee,'total',o.total,'created_at',o.created_at,'history',(SELECT coalesce(jsonb_agg(jsonb_build_object('status',h.status,'note',h.note,'created_at',h.created_at) ORDER BY h.created_at),'[]') FROM public.order_history h WHERE h.order_id=o.id)) FROM public.orders o WHERE o.reference=upper(trim(ref)) AND o.phone=regexp_replace(customer_phone,'[^0-9+]','','g') $$;
REVOKE ALL ON FUNCTION public.track_store_order(text,text) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.track_store_order(text,text) TO anon,authenticated;
CREATE FUNCTION public.staff_update_order(order_uuid uuid,new_status text,new_payment text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.orders; line jsonb;
BEGIN
IF NOT public.is_staff() THEN RAISE EXCEPTION 'Staff access required.'; END IF;
SELECT * INTO o FROM public.orders WHERE id=order_uuid FOR UPDATE;
IF NOT FOUND THEN RAISE EXCEPTION 'Order not found.'; END IF;
IF o.status IN ('completed','cancelled') AND new_status<>o.status THEN RAISE EXCEPTION 'This order is closed.'; END IF;
IF new_status NOT IN ('received','processing','ready','dispatched','completed','cancelled') OR new_payment NOT IN ('pending','confirmed','rejected') THEN RAISE EXCEPTION 'Invalid status.'; END IF;
IF new_status='ready' AND o.fulfillment<>'pickup' OR new_status='dispatched' AND o.fulfillment<>'delivery' THEN RAISE EXCEPTION 'Status does not match fulfillment.'; END IF;
IF o.payment_method='momo' AND new_status IN ('processing','ready','dispatched','completed') AND new_payment<>'confirmed' THEN RAISE EXCEPTION 'Verify Mobile Money before processing.'; END IF;
IF new_status='completed' AND new_payment<>'confirmed' THEN RAISE EXCEPTION 'Confirm payment before completing the order.'; END IF;
IF new_status='cancelled' AND o.status<>'cancelled' THEN FOR line IN SELECT value FROM jsonb_array_elements(o.items) LOOP UPDATE public.products SET stock=stock+(line->>'quantity')::integer WHERE id=line->>'id'; END LOOP; END IF;
UPDATE public.orders SET status=new_status,payment_status=new_payment WHERE id=order_uuid;
INSERT INTO public.order_history(order_id,status,note,actor_id) VALUES(order_uuid,new_status,'Payment: '||new_payment,auth.uid());
END $$;
REVOKE ALL ON FUNCTION public.staff_update_order(uuid,text,text) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.staff_update_order(uuid,text,text) TO authenticated;