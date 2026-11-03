import katex from 'katex';
import 'katex/dist/katex.min.css';
document.querySelector('#app').innerHTML = '<main><h1>Множители Лагранжа</h1><p>Геометрия допустимого движения</p><div id="formula"></div></main>';
katex.render('h(t)=f(r(t))', document.querySelector('#formula'), { throwOnError: true });
document.documentElement.dataset.build = __BUILD_ID__;
