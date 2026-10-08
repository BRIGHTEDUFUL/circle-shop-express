import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import type { Database, Json } from '@/integrations/supabase/types';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
export const getStore=createServerFn({method:'GET'}).handler(async()=>{
 const key=process.env['SUPABASE_PUBLISHABLE_KEY']!;
 const client=createClient<Database>(process.env['SUPABASE_URL']!,key,{auth:{persistSession:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_')&&h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 const [p,s,c]=await Promise.all([client.from('products').select('*').order('id'),client.from('categories').select('*').order('sort_order'),client.from('store_settings').select('*').eq('id',1).single()]);
 if(p.error||c.error||s.error||!s.data)throw new Error('The store could not load. Please try again.');
 return {products:p.data,categories:c.data,settings:s.data};
});
export const staffOrders=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data:allowed}=await context.supabase.rpc('is_staff');if(!allowed)throw new Error('Staff access required. Ask the store owner to grant access.');
 const {data,error}=await context.supabase.from('orders').select('*').order('created_at',{ascending:false}).limit(100);if(error)throw new Error('Orders could not load.');return data;
});
export const updateOrder=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((data:{id:string;status:string;payment:string})=>data).handler(async({context,data})=>{
 const {error}=await context.supabase.rpc('staff_update_order',{order_uuid:data.id,new_status:data.status,new_payment:data.payment});if(error)throw new Error(error.message);return {ok:true};
});
export const submitOrder=createServerFn({method:'POST'}).inputValidator((data:Json)=>data).handler(async({data})=>{
 const key=process.env['SUPABASE_PUBLISHABLE_KEY']!;
 const client=createClient<Database>(process.env['SUPABASE_URL']!,key,{auth:{persistSession:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith('sb_'))h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 const {data:result,error}=await client.rpc('place_store_order',{payload:data});if(error)throw new Error(error.message);return result;
});