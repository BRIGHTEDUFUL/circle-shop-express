import desk from '@/assets/desk.jpg.asset.json';
import chair from '@/assets/chair.jpg.asset.json';
import keyboard from '@/assets/keyboard.jpg.asset.json';
import mouse from '@/assets/mouse.jpg.asset.json';
import mic from '@/assets/mic.jpg.asset.json';
import arm from '@/assets/arm.jpg.asset.json';
import workspace from '@/assets/workspace.jpg.asset.json';
import chairDetail from '@/assets/chair-detail.jpg.asset.json';
import logo from '@/assets/store-logo.jpeg.asset.json';
const base:Record<string,string>={desk:desk.url,gaming:desk.url,chair:chair.url,keyboard:keyboard.url,mouse:mouse.url,mic:mic.url,arm:arm.url,stand:arm.url,stream:mic.url,workspace:workspace.url,'chair-detail':chairDetail.url,logo:logo.url};
/** Built-in keys resolve to bundled photos; staff-uploaded photos are stored as full https URLs. */
export const images:Record<string,string>=new Proxy(base,{get:(t,k)=>typeof k!=='string'?undefined:t[k]??(/^https:\/\//.test(k)?k:desk.url)});
export const builtInPhotos=Object.keys(base).filter(k=>k!=='logo');
