import { queryOptions } from '@tanstack/react-query';
import type { Database, Json } from '@/integrations/supabase/types';
import { getStore } from './store.functions';
export type Product = Database['public']['Tables']['products']['Row'];
export type Settings = Database['public']['Tables']['store_settings']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type Receipt = Pick<Order,'reference'|'status'|'payment_status'|'payment_method'|'fulfillment'|'items'|'subtotal'|'delivery_fee'|'total'|'created_at'> & {history?: {status:string;note:string;created_at:string}[]};
export const categories = [
 {id:'desks',name:'Gaming & office desks',short:'Desks',image:'desk'},
 {id:'chairs',name:'Office chairs',short:'Chairs',image:'chair'},
 {id:'accessories',name:'Computer accessories',short:'Accessories',image:'keyboard'},
 {id:'mounts',name:'Stands & mounts',short:'Stands & mounts',image:'arm'},
 {id:'audio',name:'Streaming & audio',short:'Streaming & audio',image:'mic'},
];
export const money=(n:number,decimals=false)=>`GH₵ ${n.toLocaleString('en-GH',{minimumFractionDigits:decimals?2:0,maximumFractionDigits:2})}`;
export const specs=(value:Json)=>value && typeof value==='object' && !Array.isArray(value)? Object.entries(value).map(([k,v])=>[k,String(v)]):[];
export const storeQuery=queryOptions({queryKey:['store'],queryFn:()=>getStore(),staleTime:30000});
export const pageHead=(name:string,description:string)=>({meta:[{title:`${name} | MB Ventures GH`},{name:'description',content:description},{property:'og:title',content:`${name} | MB Ventures GH`},{property:'og:description',content:description},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]});
export const delivery=(settings:Settings,zone:string,subtotal:number,pickup=false)=>pickup||subtotal>settings.free_threshold?0:zone==='central'?settings.central_fee:zone==='greater'?settings.greater_fee:settings.nationwide_fee;
export const zones=[{id:'central',name:'Accra Central & Circle',time:'Same day or next day'},{id:'greater',name:'Greater Accra',time:'1–2 business days'},{id:'nationwide',name:'Nationwide',time:'2–4 business days'}];