import { cylinder } from '../math/examples/cylinder.js';
import { counterexample } from '../math/examples/counterexample.js';
import { createStore } from '../state/sceneStore.js';
import { createSurface } from '../graphics/three/surface.js';
import { createProfile } from '../graphics/svg/profile.js';
import { createCircle } from '../graphics/svg/circle.js';
import { math,number,pair } from '../ui/format.js';
export function CylinderScene(root){
 const store=createStore(cylinder);
 root.innerHTML=`<div class="scene-top"><span class="scene-label">Рис. 3 · Поверхность и цилиндр</span><button data-action="reset">Сбросить сцену</button></div><div class="scene-layout"><div class="world"><div class="world-labels"><span class="blue" data-surface-label>z = x + x² − y²</span><span class="orange">x² + y² = 1</span></div><div class="world-note">Мышь — поворот · колесо — масштаб<br>Оси x, y, z показаны в одном масштабе</div></div><div class="profile-panel"><div class="plot-title" data-profile-title>Профиль h(t) = cos t + cos 2t</div><div data-profile></div><div class="circle-readouts"><div data-circle></div><dl class="readouts"><div class="wide"><dt>Точка P</dt><dd data-value="point"></dd></div><div><dt>Высота</dt><dd data-value="height"></dd></div><div><dt>h′(t)</dt><dd data-value="derivative"></dd></div><div class="wide" data-multiplier hidden><dt>Множитель λ</dt><dd data-value="lambda"></dd></div></dl></div><p class="proof-status" aria-live="polite"></p></div></div><div class="legend"><span class="blue">Поверхность f</span><span class="orange">Цилиндр, пересечение и окружность</span></div><div class="controls"><div class="slider-row"><label for="cylinder-t">Угол t</label><input id="cylinder-t" type="range" min="0" max="6.283185307179586" step="0.005" value="3.141592653589793"><output for="cylinder-t"></output></div><div class="control-buttons"><button data-action="local">Локальный максимум · 0</button><button class="primary" data-action="global">Глобальный максимум · 2</button><button data-action="candidates" aria-pressed="false">Показать кандидатов</button><button data-action="camera">Исходный ракурс</button></div><p class="instruction">Перемещайте точку по профилю, окружности или ползунком. При t = 2π путь возвращается к t = 0.</p></div><details class="cylinder-extra"><summary>Исследовать четыре точки и контрпример</summary><div class="control-buttons"><button data-model="cylinder" aria-pressed="true">f = x + x² − y²</button><button data-model="counterexample" aria-pressed="false">Контрпример: f = y³</button><button data-action="minimum-plus">Минимум · y &gt; 0</button><button data-action="minimum-minus">Минимум · y &lt; 0</button><button data-action="stationary">Точка t = 0</button></div><p class="instruction">На окружности показаны ∇f (бирюзовый) и ∇g (фиолетовый). Один масштаб для обоих: 0,38 единицы оси на единицу вектора; нулевой вектор стрелкой не изображается.</p><div data-analysis></div></details>`;
 const world=createSurface(root.querySelector('.world'),cylinder),profile=createProfile(root.querySelector('[data-profile]'),cylinder,t=>store.set({t}),{yRange:[-1.5,2.5],height:190});
 const circle=createCircle(root.querySelector('[data-circle]'),t=>store.set({t}));
 const details=root.querySelector('details'),slider=root.querySelector('input');
 slider.oninput=()=>store.set({t:+slider.value});
 details.addEventListener('toggle',()=>{if(!details.open&&store.get().model.id!=='cylinder')store.useModel(cylinder);else store.set({});});
 root.querySelector('[data-action=local]').onclick=()=>{if(store.get().model!==cylinder)store.useModel(cylinder);store.set({t:Math.PI});};
 root.querySelector('[data-action=global]').onclick=()=>{if(store.get().model!==cylinder)store.useModel(cylinder);store.set({t:0});};
 root.querySelector('[data-action=candidates]').onclick=()=>store.set({candidates:!store.get().candidates});
 root.querySelector('[data-action=camera]').onclick=()=>world.resetCamera();
 root.querySelector('[data-action=reset]').onclick=()=>{details.open=false;store.reset();world.resetCamera();};
 for(const [id,model]of Object.entries({cylinder,counterexample}))root.querySelector(`[data-model=${id}]`).onclick=()=>store.useModel(model);
 root.querySelector('[data-action=minimum-plus]').onclick=()=>store.set({t:store.get().model===cylinder?Math.acos(-.25):Math.PI/2,candidates:true});
 root.querySelector('[data-action=minimum-minus]').onclick=()=>store.set({t:store.get().model===cylinder?2*Math.PI-Math.acos(-.25):3*Math.PI/2,candidates:true});
 root.querySelector('[data-action=stationary]').onclick=()=>store.set({t:0});
 let renderedModel;
 store.subscribe(s=>{
  world.update(s);profile.update(s,{candidates:s.candidates});circle.update(s,{gradients:details.open});slider.value=s.t;root.querySelector('output').textContent=number(s.t);
  for(const[k,v]of Object.entries({point:pair(s.math.point),height:number(s.math.height),derivative:number(s.math.derivative),lambda:s.math.lambda===null?'—':number(s.math.lambda)}))root.querySelector(`[data-value=${k}]`).textContent=v;
  root.querySelector('[data-multiplier]').hidden=!details.open;root.querySelector('[data-action=candidates]').setAttribute('aria-pressed',s.candidates);
  const critical=s.model.critical.find(c=>Math.abs(c.t-s.t)<1e-7);root.querySelector('.proof-status').textContent=critical?`${critical.kind}. Высота ${number(critical.height)}.`:'Точка движется по допустимой окружности; это не стационарное положение.';
  if(renderedModel!==s.model){
   const isMain=s.model===cylinder;root.querySelector('[data-surface-label]').textContent=isMain?'z = x + x² − y²':'z = y³';root.querySelector('[data-profile-title]').textContent=isMain?'Профиль h(t) = cos t + cos 2t':'Контрпример: h(t) = sin³ t';
   root.querySelectorAll('[data-model]').forEach(el=>el.setAttribute('aria-pressed',el.dataset.model===s.model.id));
   root.querySelector('[data-action=minimum-plus]').hidden=!isMain;
   root.querySelector('[data-analysis]').innerHTML=isMain?`${math("h'(t)=-\\sin t(1+4\\cos t)=0",true)}<p>Либо sin t = 0, либо cos t = −1/4. На окружности получаем четыре точки:</p><div class="table-scroll"><table><thead><tr><th>Точка (x; y)</th><th>f</th><th>λ</th><th>Классификация</th></tr></thead><tbody><tr><td>(1; 0)</td><td>2</td><td>3/2</td><td>Глобальный максимум</td></tr><tr><td>(−1; 0)</td><td>0</td><td>1/2</td><td>Локальный, не глобальный максимум</td></tr><tr><td>(−1/4; √15/4)</td><td>−9/8</td><td>−1</td><td>Глобальный минимум</td></tr><tr><td>(−1/4; −√15/4)</td><td>−9/8</td><td>−1</td><td>Глобальный минимум</td></tr></tbody></table></div><p>В минимумах ∇f = −∇g: градиенты противоположны. Окружность компактна, поэтому непрерывная функция достигает глобальных экстремумов.</p>`:`${math("h(t)=\\sin^3t,\\quad h'(0)=0,\\quad\\nabla f(1,0)=0,\\quad\\lambda=0",true)}<p>При t = 0 экстремума нет: sin³ t меняет знак. Проведите точку через правый край окружности: значения перед 2π отрицательны, сразу после 0 положительны. Условие Лагранжа выполнено, но недостаточно.</p>`;
   renderedModel=s.model;
  }
  root.dataset.t=s.t;root.dataset.height=s.math.height;root.dataset.model=s.model.id;root.dataset.lambda=s.math.lambda===null?'none':s.math.lambda;
 });return store;
}
