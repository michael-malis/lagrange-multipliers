import { svgElement } from './profile.js';
export function createCircle(host,onChange){
 const size=260,scale=51,center=130,k=.38;
 const xy=([x,y])=>[center+x*scale,center-y*scale];
 const svg=svgElement('svg',{viewBox:`0 0 ${size} ${size}`,class:'plane circle-plot',role:'img','aria-label':'Допустимая окружность в плоскости x y. Точку можно перетаскивать по окружности.'});host.append(svg);
 const defs=svgElement('defs');svg.append(defs);
 for(const[key,color]of[['gf','#77bdb5'],['gg','#b6a4cf']]){const marker=svgElement('marker',{id:`circle-${key}`,viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:7,markerHeight:7,orient:'auto',markerUnits:'userSpaceOnUse'});marker.append(svgElement('path',{d:'M0 0 L10 5 L0 10 Z',fill:color}));defs.append(marker);}
 for(const [x1,y1,x2,y2]of[[18,130,244,130],[130,18,130,244]])svg.append(svgElement('line',{x1,y1,x2,y2,class:'axis'}));
 for(const[text,x,y]of[['x',245,146],['y',140,20],['1',181,146],['−1',66,146]]){const el=svgElement('text',{x,y});el.textContent=text;svg.append(el);}
 svg.append(svgElement('circle',{cx:center,cy:center,r:scale,fill:'none',stroke:'#e3a15c','stroke-width':1.8}));
 const dyn=svgElement('g');svg.append(dyn);
 let dragging=false;
 const move=e=>{const p=new DOMPoint(e.clientX,e.clientY).matrixTransform(svg.getScreenCTM().inverse());onChange(Math.atan2(center-p.y,p.x-center));};
 svg.addEventListener('pointerdown',e=>{dragging=true;svg.setPointerCapture(e.pointerId);move(e);});svg.addEventListener('pointermove',e=>{if(dragging)move(e);});for(const type of ['pointerup','pointercancel','lostpointercapture'])svg.addEventListener(type,()=>dragging=false);
 return{update(s,{gradients=false}={}){
  dyn.replaceChildren();const m=s.math,[cx,cy]=xy(m.point);
  if(s.candidates)for(const c of s.model.critical){const p=xy(c.point);dyn.append(svgElement('circle',{cx:p[0],cy:p[1],r:3.5,fill:'none',stroke:'#e3a15c'}));}
  if(gradients)for(const[key,v,color,offset]of[['gf',m.gradient,'#77bdb5',-11],['gg',m.normal,'#b6a4cf',19]]){
    if(Math.hypot(...v)<1e-9){const label=svgElement('text',{x:cx-34,y:cy-15});label.style.fill=color;label.textContent='∇f = 0';dyn.append(label);continue;}
    const [x2,y2]=xy(m.point.map((x,i)=>x+k*v[i]));dyn.append(svgElement('line',{x1:cx,y1:cy,x2,y2,stroke:color,'stroke-width':2.3,'marker-end':`url(#circle-${key})`,'data-vector':key}));
    const label=svgElement('text',{x:Math.min(225,Math.max(8,x2+3)),y:y2+offset,class:'vector-label'});label.style.fill=color;label.textContent=key==='gf'?'∇f':'∇g';dyn.append(label);
  }
  dyn.append(svgElement('circle',{cx,cy,r:5,class:'point'}));svg.dataset.point=JSON.stringify(m.point);svg.dataset.gradient=JSON.stringify(m.gradient);svg.dataset.normal=JSON.stringify(m.normal);
 }};
}
