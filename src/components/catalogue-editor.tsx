import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { categories,specs as specRows,type Product } from '@/lib/store';
import { images } from '@/lib/store-images';
import { toast } from 'sonner';

const TEN_YEARS=60*60*24*365*10;
async function upload(file:File){
  if(!file.type.startsWith('image/'))throw new Error('Choose an image file.');
  const path=`${crypto.randomUUID()}.${file.name.split('.').pop()||'jpg'}`;
  const up=await supabase.storage.from('product-photos').upload(path,file,{contentType:file.type});
  if(up.error)throw up.error;
  const signed=await supabase.storage.from('product-photos').createSignedUrl(path,TEN_YEARS);
  if(signed.error||!signed.data)throw signed.error??new Error('Photo link failed');
  return signed.data.signedUrl;
}
type Draft={id:string;name:string;brand:string;category:string;price:string;original_price:string;stock:string;description:string;image_key:string;gallery:string[];specs:[string,string][];verified:boolean};
const toDraft=(p?:Product):Draft=>({id:p?.id??'',name:p?.name??'',brand:p?.brand??'',category:p?.category??'desks',price:p?String(p.price):'',original_price:p?.original_price!=null?String(p.original_price):'',stock:p?String(p.stock):'0',description:p?.description??'',image_key:p?.image_key??'',gallery:p?.gallery??[],specs:p?specRows(p.specs) as [string,string][]:[],verified:p?.verified??false});

export function CatalogueEditor({products,refresh}:{products:Product[];refresh:()=>void}){
  const [editing,setEditing]=useState<string|null>(null),[q,setQ]=useState(''),[show,setShow]=useState<'all'|'sample'|'verified'>('all');
  const list=products.filter(p=>(show==='all'||(show==='verified')===p.verified)&&`${p.name} ${p.brand} ${p.id}`.toLowerCase().includes(q.toLowerCase()));
  const samples=products.filter(p=>!p.verified).length;
  return <div>
    <p className="mb-5 text-sm text-muted-foreground">{samples} of {products.length} listings are still samples. Replace each with the real name, price, specifications, photos and stock, then mark it verified. Only verified items can be ordered.</p>
    <div className="mb-5 flex flex-wrap gap-3"><input aria-label="Search catalogue" className="max-w-xs" placeholder="Search products" value={q} onChange={e=>setQ(e.target.value)}/><select aria-label="Show listings" className="max-w-[12rem]" value={show} onChange={e=>setShow(e.target.value as typeof show)}><option value="all">All listings</option><option value="sample">Samples only</option><option value="verified">Verified only</option></select><Button onClick={()=>setEditing('new')}>Add product</Button></div>
    {editing==='new'&&<Editor draft={toDraft()} isNew onDone={()=>{setEditing(null);refresh();}} onCancel={()=>setEditing(null)}/>}
    {list.map(p=>editing===p.id?<Editor key={p.id} draft={toDraft(p)} onDone={()=>{setEditing(null);refresh();}} onCancel={()=>setEditing(null)}/>:
      <div key={p.id} className="solid-panel mb-3 flex items-center gap-4"><img src={images[p.image_key]} alt="" className="size-14 rounded object-cover"/><div className="min-w-0 flex-1"><p className="font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.brand} · GH₵ {p.price} · {p.stock} in stock</p></div><span className={`text-xs font-semibold ${p.verified?'text-success':'text-offer'}`}>{p.verified?'Verified':'Sample'}</span><Button variant="outline" onClick={()=>setEditing(p.id)}>Edit</Button></div>)}
  </div>;
}

function Editor({draft,isNew,onDone,onCancel}:{draft:Draft;isNew?:boolean;onDone:()=>void;onCancel:()=>void}){
  const [d,setD]=useState(draft),[busy,setBusy]=useState(false);
  const set=<K extends keyof Draft>(k:K,v:Draft[K])=>setD(x=>({...x,[k]:v}));
  const addPhotos=async(files:FileList|null,main:boolean)=>{if(!files?.length)return;setBusy(true);try{const urls=[];for(const f of Array.from(files))urls.push(await upload(f));if(main){set('image_key',urls[0]!);if(urls.length>1)set('gallery',[...d.gallery,...urls.slice(1)]);}else set('gallery',[...d.gallery,...urls]);toast.success('Photo uploaded');}catch(e){toast.error(e instanceof Error?e.message:'Upload failed');}setBusy(false);};
  const save=async(e:React.FormEvent)=>{e.preventDefault();
    const price=Number(d.price),stock=Number(d.stock),orig=d.original_price?Number(d.original_price):null;
    if(!(price>0))return toast.error('Enter a price above zero.');
    if(!Number.isInteger(stock)||stock<0)return toast.error('Stock must be a whole number.');
    if(orig!==null&&orig<=price)return toast.error('Original price must be higher than the sale price.');
    if(!d.image_key)return toast.error('Add a main photo.');
    if(d.verified&&!/^https:\/\//.test(d.image_key)&&!window.confirm('This item still uses a stock illustration photo. Mark verified anyway?'))return;
    const id=isNew?(d.id||d.name).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''):d.id;
    if(!id)return toast.error('Enter a product name.');
    const row={id,name:d.name.trim(),brand:d.brand.trim(),category:d.category,price,original_price:orig,stock,description:d.description.trim(),image_key:d.image_key,gallery:d.gallery,specs:Object.fromEntries(d.specs.filter(([k,v])=>k.trim()&&v.trim()).map(([k,v])=>[k.trim(),v.trim()])),verified:d.verified};
    setBusy(true);const {error}=isNew?await supabase.from('products').insert(row):await supabase.from('products').update(row).eq('id',id);setBusy(false);
    if(error)toast.error(error.code==='23505'?'A product with this link name already exists.':error.message);else{toast.success(isNew?'Product added':'Product saved');onDone();}};
  const remove=async()=>{if(!window.confirm(`Remove ${d.name} from the catalogue? Past orders keep their details.`))return;const {error}=await supabase.from('products').delete().eq('id',d.id);if(error)toast.error(error.message);else{toast.success('Product removed');onDone();}};
  return <form onSubmit={save} className="solid-panel mb-5 space-y-5">
    <h2 className="text-xl">{isNew?'New product':`Edit ${draft.name}`}</h2>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="sm:col-span-2">Product name<input required minLength={2} value={d.name} onChange={e=>set('name',e.target.value)}/></label>
      {isNew&&<label className="sm:col-span-2">Link name (optional)<input placeholder="e.g. logitech-mx-keys" value={d.id} onChange={e=>set('id',e.target.value)}/></label>}
      <label>Brand<input required value={d.brand} onChange={e=>set('brand',e.target.value)}/></label>
      <label>Category<select value={d.category} onChange={e=>set('category',e.target.value)}>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label>Price GH₵<input required type="number" min="0.01" step="0.01" value={d.price} onChange={e=>set('price',e.target.value)}/></label>
      <label>Was price GH₵ (optional, for sales)<input type="number" min="0" step="0.01" value={d.original_price} onChange={e=>set('original_price',e.target.value)}/></label>
      <label>Stock on hand<input required type="number" min="0" step="1" value={d.stock} onChange={e=>set('stock',e.target.value)}/></label>
      <label className="sm:col-span-2">Description<textarea rows={4} value={d.description} onChange={e=>set('description',e.target.value)}/></label>
    </div>
    <div><h3 className="mb-2 font-semibold">Photos</h3><div className="flex flex-wrap gap-3">
      {d.image_key&&<figure className="text-center text-xs"><img src={images[d.image_key]} alt="Main" className="size-24 rounded object-cover"/><figcaption>Main</figcaption></figure>}
      {d.gallery.map((g,i)=><figure key={g+i} className="text-center text-xs"><img src={images[g]} alt={`Extra ${i+1}`} className="size-24 rounded object-cover"/><div className="flex justify-center gap-1"><Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={()=>{set('gallery',[...d.gallery.filter((_,j)=>j!==i),d.image_key].filter(Boolean));set('image_key',g);}}>Make main</Button><Button type="button" variant="link" className="h-auto p-0 text-xs" onClick={()=>set('gallery',d.gallery.filter((_,j)=>j!==i))}>Remove</Button></div></figure>)}
    </div><div className="mt-3 flex flex-wrap gap-4"><label className="text-sm">{d.image_key?'Replace main photo':'Upload main photo'}<input type="file" accept="image/*" disabled={busy} onChange={e=>{addPhotos(e.target.files,true);e.target.value='';}}/></label><label className="text-sm">Add more photos<input type="file" accept="image/*" multiple disabled={busy} onChange={e=>{addPhotos(e.target.files,false);e.target.value='';}}/></label></div></div>
    <div><h3 className="mb-2 font-semibold">Specifications</h3>{d.specs.map(([k,v],i)=><div key={i} className="mb-2 flex gap-2"><input aria-label="Specification name" placeholder="e.g. Dimensions" value={k} onChange={e=>set('specs',d.specs.map((s,j)=>j===i?[e.target.value,s[1]]:s))}/><input aria-label="Specification value" placeholder="e.g. 140 × 70 cm" value={v} onChange={e=>set('specs',d.specs.map((s,j)=>j===i?[s[0],e.target.value]:s))}/><Button type="button" variant="ghost" aria-label="Remove specification" onClick={()=>set('specs',d.specs.filter((_,j)=>j!==i))}>×</Button></div>)}<Button type="button" variant="outline" onClick={()=>set('specs',[...d.specs,['','']])}>Add specification</Button></div>
    <label className="filter-line"><input type="checkbox" checked={d.verified} onChange={e=>set('verified',e.target.checked)}/>Verified: name, price, specs, photos and stock match what is in the shop</label>
    <div className="flex flex-wrap gap-3"><Button disabled={busy}>{busy?'Working…':'Save product'}</Button><Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>{!isNew&&<Button type="button" variant="ghost" className="ml-auto text-destructive" onClick={remove}>Remove product</Button>}</div>
  </form>;
}
