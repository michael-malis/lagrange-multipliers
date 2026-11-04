export const proofSteps = [
  {
    title: "1. Знак производной",
    text: "Перемещайте точку по прямой. Производная h′(t) показывает, как меняется высота при увеличении t: до максимума она положительна, в максимуме равна нулю, после — отрицательна. Мы рассматриваем только движение, разрешённое ограничением.",
    formula: String.raw`\begin{gathered}h(t)=f(r(t)),\\ h'(t_0)=0\quad\text{во внутреннем экстремуме}.\end{gathered}`,
  },
  {
    title: "2. Правило цепочки",
    text: "При изменении t координаты меняются вместе: x′(t)=1, y′(t)=−1. По правилу цепочки их вклады складываются. Вектор T=(1,−1) направлен вдоль прямой, а ∇f задаёт изменение функции. Их скалярное произведение равно h′(t). Если угол между ними острый, высота растёт; если тупой — убывает.",
    formula: String.raw`\begin{aligned}h'(t)&=f_x(r(t))\,x'(t)+f_y(r(t))\,y'(t)\\&=\nabla f(r(t))\cdot T.\end{aligned}`,
    extra: String.raw`D_{\widehat T}f=\nabla f\cdot\widehat T=\frac{h'(t)}{\|T\|}=\frac{h'(t)}{\sqrt2}.`,
  },
  {
    title: "3. Проекция градиента",
    text: "Разложим градиент на составляющую вдоль прямой и перпендикулярную ей. Первая — ортогональная проекция на направление T. До максимума она направлена по T, после — против T, а в максимуме обращается в ноль. Её коэффициент имеет знак, а длина всегда неотрицательна. Сам ∇f при этом не исчезает.",
    formula: String.raw`\begin{aligned}\operatorname{proj}_{T}\nabla f&=\frac{\nabla f\cdot T}{\|T\|^2}T\\&=\frac{h'(t)}{2}T.\end{aligned}`,
    extra: String.raw`\operatorname{proj}_{T}\nabla f(P^*)=0,\qquad \nabla f(P^*)=\left(\frac83,\frac83\right)\ne0.`,
  },
  {
    title: "4. Условие Лагранжа",
    text: "Вдоль допустимой прямой значение g постоянно, поэтому ∇g·T=0. В максимуме также ∇f·T=0. Значит, оба градиента перпендикулярны T и лежат на одной нормальной прямой. При ∇g≠0 существует число λ, для которого ∇f=λ∇g. Это необходимое условие, а не доказательство максимума.",
    formula: String.raw`\begin{aligned}\nabla f(P_{\max})\cdot T&=0,\\ \nabla g(P_{\max})\cdot T&=0.\end{aligned}`,
    extra: String.raw`\boxed{\nabla f(P_{\max})=\lambda\nabla g(P_{\max})},\quad g(P_{\max})=c,\quad \nabla g(P_{\max})\ne0.`,
  },
];

export const geometry = String.raw`
<section id="geometry" class="section"><div class="reading"><div class="section-head"><span class="section-number">II</span><div><h2>Почему градиенты становятся параллельны?</h2><p class="section-deck">Мы уже знаем положение максимума на прямой. Теперь объясним его геометрически: что происходит с производной вдоль допустимого направления?</p></div></div>
<p>Линия уровня — это множество точек, в которых функция имеет одно и то же значение <span data-tex="\ell"></span>. Для нашего параболоида получаем:</p>
<div class="equation" data-tex="f(x,y)=\ell\quad\Longleftrightarrow\quad (x-3)^2+2(y-2)^2=5-\ell"></div>
<p>При <span data-tex="\ell<5"></span> получаем эллипсы с центром <span data-tex="(3,2)"></span>. Чем выше уровень <span data-tex="\ell"></span>, тем меньше эллипс. Уровень <span data-tex="\ell=5"></span> состоит из одной точки — вершины параболоида.</p>
<p>Выделенный эллипс проходит через выбранную точку <span data-tex="P=r(t)"></span>. Его уровень <span data-tex="\ell=f(P)=h(t)"></span> совпадает с высотой на профиле.</p><p class="scene-direction"><strong>Попробуйте:</strong> передвигайте точку и нажимайте «Следующий шаг». Следите за градиентом, касательной проекцией и формулой справа.</p></div>
<div id="scene-two" class="scene" data-scene="2"></div>
<div class="reading">
<p>Мы получили необходимое условие Лагранжа в регулярной точке:</p>
<div class="equation" data-tex="\boxed{\nabla f(P)=\lambda\nabla g(P)},\qquad g(P)=c,\qquad \nabla g(P)\ne0."></div>
<p>На рисунке это выглядит как касание допустимой прямой и линии уровня в точке <span data-tex="P^*"></span>. Строгий смысл касания здесь — равенство <span data-tex="\nabla f(P^*)\cdot T=0"></span>, полученное из правила цепочки.</p>
<aside class="math-note"><h3>Что утверждает теорема</h3><p>При <span data-tex="f,g\in C^1"></span> условие <span data-tex="\nabla f=\lambda\nabla g"></span> необходимо для локального экстремума на регулярной кривой <span data-tex="g=c"></span>. Необходимость не означает достаточности: система даёт кандидатов, которые ещё нужно классифицировать.</p><p>Знак множителя не фиксирован. При <span data-tex="\lambda>0"></span> ненулевые градиенты сонаправлены, при <span data-tex="\lambda<0"></span> противоположны; при <span data-tex="\lambda=0"></span> возможен нулевой <span data-tex="\nabla f"></span>. Нулевой множитель не запрещён.</p></aside>
<aside class="math-note"><h3>Зачем нужна регулярность</h3><p>Если <span data-tex="g(x,y)=x^2+y^2=0"></span>, допустима только точка <span data-tex="(0,0)"></span>. Для <span data-tex="f(x,y)=x"></span> она одновременно максимум и минимум на допустимом множестве, однако <span data-tex="\nabla g(0,0)=0"></span> и уравнение <span data-tex="\nabla f=\lambda\nabla g"></span> невозможно. Теорема не опровергнута: нарушена её предпосылка.</p></aside>
<aside class="math-note"><h3>Ещё один пример: расстояние до прямой</h3><p>Минимизация <span data-tex="(x-3)^2+(y-3)^2"></span> на прямой <span data-tex="x+2y=10"></span> означает расширять окружности с центром <span data-tex="(3,3)"></span> до первого касания с прямой. Нормаль <span data-tex="(1,2)"></span> даёт</p><div class="equation" data-tex="P^*=(3,3)+\frac15(1,2)=\left(\frac{16}{5},\frac{17}{5}\right),\qquad f(P^*)=\frac15."></div><p>Это дополнительный пример геометрии нормалей, а не новое доказательство метода.</p></aside>
<div class="chapter-transition"><span class="transition-kicker">Следующий вопрос</span><p>Коллинеарность градиентов даёт систему уравнений, но пока только кандидата. Сначала вычислим его, а затем проверим, что он действительно максимум.</p><a href="#calculation">Применим условие к параболоиду <span aria-hidden="true">→</span></a></div>
</div></section>`;
