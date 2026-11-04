export const application = String.raw`
<section id="calculation" class="section reading"><div class="section-head"><span class="section-number">§ 2</span><div><h2>Условие как вычислительная система</h2><p class="section-deck">Применим полученное условие к исходной задаче и сравним ответ с подстановкой.</p></div></div>
<p>Условие <span data-tex="\nabla f=\lambda\nabla g"></span> даёт два уравнения для координат. Вместе с ограничением имеем три уравнения для <span data-tex="x,y,\lambda"></span>:</p>
<div class="equation" data-tex="\begin{cases}f_x(x,y)=\lambda g_x(x,y),\\ f_y(x,y)=\lambda g_y(x,y),\\ g(x,y)=c.\end{cases}"></div>
<div class="algorithm">
<div><section><h3>Подставим производные</h3><p>Для <span data-tex="g(x,y)=x+y"></span> имеем <span data-tex="\nabla g=(1,1)"></span>, поэтому</p><div class="equation" data-tex="\begin{cases}-2(x-3)=\lambda,\\-4(y-2)=\lambda,\\x+y=3.\end{cases}"></div></section></div>
<div><section><h3>Выразим координаты через множитель</h3><p>Из первых двух уравнений получаем:</p><div class="equation" data-tex="x=3-\frac\lambda2,\qquad y=2-\frac\lambda4."></div><p>Подстановка в ограничение определяет множитель:</p><div class="equation" data-tex="5-\frac{3\lambda}{4}=3\quad\Longrightarrow\quad\lambda=\frac83."></div><div class="result"><div class="equation" data-tex="P^*=\left(\frac53,\frac43\right),\qquad f(P^*)=\frac73."></div></div><p>Мы получили ту же точку, что и подстановкой: прямая касается уровня <span data-tex="f=\frac73"></span>, а касательная компонента градиента обращается в ноль.</p></section></div>
<div><section><h3>От кандидата к глобальному максимуму</h3><p>Система нашла кандидата. Докажем, что это максимум на всей прямой, завершив квадрат:</p><div class="equation" data-tex="h(t)=-3t^2+10t-6=\frac73-3\left(t-\frac53\right)^2."></div><p>Отсюда <span data-tex="h(t)\le\frac73"></span> для всех <span data-tex="t\in\mathbb R"></span>, причём равенство возможно только при <span data-tex="t=\frac53"></span>. Следовательно, <span data-tex="P^*"></span> — единственный глобальный максимум на всей допустимой прямой. Глобального минимума нет, поскольку <span data-tex="h(t)\to-\infty"></span> при <span data-tex="|t|\to\infty"></span>.</p></section></div>
</div>

<aside class="math-note"><h3>Лагранжиан: короткая запись системы</h3><p>Для записи той же системы удобно ввести одну вспомогательную функцию — лагранжиан:</p>
<div class="equation" data-tex="\mathcal L(x,y,\lambda)=f(x,y)-\lambda\bigl(g(x,y)-c\bigr)."></div>
<p>Его производные возвращают исходные уравнения: равенства <span data-tex="\mathcal L_x=\mathcal L_y=0"></span> воспроизводят пропорциональность градиентов, а <span data-tex="\mathcal L_\lambda=0"></span> возвращает ограничение.</p>

</aside>

<aside class="math-note"><h3>Необходимость и достаточность</h3><p>Уравнения Лагранжа — необходимое условие в регулярной точке локального экстремума, но не достаточное. В одномерной параметризации знак <span data-tex="h''(t_0)"></span> даёт привычный локальный критерий: отрицательный — строгий максимум, положительный — строгий минимум. Для нескольких переменных тот же принцип выражается знаком квадратичной формы</p><div class="equation" data-tex="v^{\mathsf T}\nabla^2_{xx}\mathcal L(P,\lambda)v,\qquad \nabla g(P)\cdot v=0,"></div><p>то есть гессиан лагранжиана исследуется только на допустимых касательных направлениях. Для глобального максимума по-прежнему нужно дополнительное доказательство.</p></aside>

<aside class="math-note"><h3>Несколько ограничений</h3><p>Если в <span data-tex="\mathbb R^n"></span> заданы равенства <span data-tex="g_j(x)=c_j"></span> и их градиенты линейно независимы, нормальное пространство порождается всеми этими градиентами. Поэтому необходимое условие принимает вид</p><div class="equation" data-tex="\nabla f(P)=\sum_{j=1}^{m}\lambda_j\nabla g_j(P)."></div><p>Это та же геометрическая мысль: допустимое изменение первого порядка исчезает на всём касательном пространстве.</p></aside>
<div class="chapter-transition"><span class="transition-kicker">Проверим границы метода</span><p>Вычисления дали точку максимума, но только отдельное доказательство подтвердило её тип. На окружности мы найдём несколько стационарных точек и увидим, что условие Лагранжа может выполняться даже там, где экстремума нет.</p><a href="#cylinder">03 · Кандидаты и контрпример <span aria-hidden="true">→</span></a></div>
</section>

<section id="cylinder" class="section"><div class="reading"><div class="section-head"><span class="section-number">III</span><div><h2>Когда условие Лагранжа не гарантирует экстремум</h2><p class="section-deck">В предыдущей задаче мы получили кандидата и отдельно доказали максимум. Что произойдёт, если ограничение — окружность, а стационарных точек несколько?</p></div></div>
<p>Сначала сравним четыре стационарных положения одной функции, затем сохраним окружность и изменим целевую функцию — так обнаружим точку, где условие выполняется, а экстремума нет.</p><p>Исходная функция и ограничение:</p><div class="equation" data-tex="f(x,y)=x+x^2-y^2,\qquad x^2+y^2=1."></div>
<p>Окружность параметризуется как <span data-tex="r(t)=(\cos t,\sin t)"></span>. Вертикальный цилиндр вырезает на поверхности замкнутую пространственную кривую, а её высота равна</p><div class="equation" data-tex="h(t)=f(r(t))=\cos t+\cos2t."></div>
<p class="scene-direction"><strong>Попробуйте:</strong> сравните локальный максимум <span data-tex="(-1,0)"></span> и глобальный <span data-tex="(1,0)"></span>. Затем включите стационарные точки и замените целевую функцию, не меняя окружность.</p><p>Стационарность вдоль окружности означает <span data-tex="h'(t_0)=0"></span>. Это необходимый признак внутреннего экстремума на гладкой кривой, но пока не его классификация.</p></div>
<div id="scene-three" class="scene" data-scene="3"></div>
<div class="reading">
<h3>Классификация четырёх стационарных точек (рисунок 3)</h3>
<p>Для исходной функции найдём все решения <span data-tex="h'(t)=0"></span> за один оборот и затем проверим каждое из них.</p>
<p>Дифференцируя по параметру и используя <span data-tex="\sin 2t=2\sin t\cos t"></span>, получаем</p>
<div class="equation" data-tex="h'(t)=-\sin t-2\sin 2t=-\sin t\,(1+4\cos t)."></div>
<p>Произведение равно нулю, когда хотя бы один множитель равен нулю:</p>
<div class="equation" data-tex="\sin t=0\qquad\text{или}\qquad\cos t=-\frac14."></div>
<p>На одном обороте <span data-tex="0\le t<2\pi"></span> первое условие даёт <span data-tex="t=0,\pi"></span>, а второе — два значения угла с одинаковой абсциссой <span data-tex="x=-\frac14"></span> и противоположными ординатами <span data-tex="y=\pm\frac{\sqrt{15}}4"></span>. Так возникают четыре разные точки, отмеченные на профиле рисунка 3.</p>
<p><strong>Классифицируем кандидатов второй производной.</strong> Здесь <span data-tex="h''(t)=-\cos t-4\cos 2t"></span>: при <span data-tex="t=0"></span> имеем <span data-tex="h''(0)=-5<0"></span> и высоту <span data-tex="2"></span>; при <span data-tex="t=\pi"></span> — <span data-tex="h''(\pi)=-3<0"></span> и высоту <span data-tex="0"></span>. Обе точки — строгие локальные максимумы.</p>
<p>Для двух оставшихся точек <span data-tex="\cos t=-\frac14"></span>, поэтому <span data-tex="\cos 2t=-\frac78"></span> и <span data-tex="h''(t)=\frac{15}4>0"></span>. Это строгие локальные минимумы высоты <span data-tex="-\frac98"></span>. Они также глобальные: при <span data-tex="u=\cos t\in[-1,1]"></span> получаем <span data-tex="h(t)=2u^2+u-1=2(u+\frac14)^2-\frac98"></span>, так что меньшей высоты на окружности нет.</p>
<p>Наконец, в этих минимумах <span data-tex="\lambda=-1"></span>. Следовательно, <span data-tex="\nabla f=-\nabla g"></span>: градиенты направлены противоположно. На рисунке 3 это можно увидеть, включив векторы в соответствующем положении точки.</p>
<aside class="math-note"><h3>Почему глобальные экстремумы существуют</h3><p>Окружность компактна, поэтому непрерывная функция достигает на ней глобальных максимума и минимума. Это утверждение гарантирует существование, но не классифицирует каждую стационарную точку. В основной задаче допустимая прямая некомпактна; существование максимума там было доказано непосредственно формой <span data-tex="h(t)"></span>.</p></aside>
<aside class="math-note math-example"><h3>Дополнительный пример: стационарная точка без экстремума</h3>
<p>Переключите рисунок 3 на новую целевую функцию. Ограничение остаётся прежним:</p>
<div class="equation" data-tex="\begin{aligned} f_{\mathrm{alt}}(x,y)&=x^2+y^2-1+y^3,\\ g(x,y)&=x^2+y^2=1.\end{aligned}"></div>
<p>На окружности высота и её производная имеют вид</p>
<div class="equation" data-tex="\begin{aligned}h(t)&=\sin^3t,\\h'(t)&=3\sin^2t\cos t,\\h'(0)&=0.\end{aligned}"></div>
<p>В точке <span data-tex="P=(1,0)"></span> выполнено необходимое условие с ненулевыми градиентами:</p>
<div class="equation" data-tex="\begin{aligned}\nabla f_{\mathrm{alt}}(P)&=(2,0)=\nabla g(P)\ne0,\\\lambda&=1.\end{aligned}"></div>
<p>Однако для достаточно малого <span data-tex="\varepsilon>0"></span>:</p>
<div class="equation" data-tex="h(-\varepsilon)<h(0)=0<h(\varepsilon)."></div>
<p class="observation">Высота меняет знак при переходе через <span data-tex="t=0"></span>. Это <strong>стационарная точка перегиба ограниченного профиля</strong>, но не условный максимум или минимум.</p>
</aside>
<div class="chapter-transition chapter-outro"><span class="transition-kicker">Что мы установили</span><p>Ненулевые коллинеарные градиенты не гарантируют максимум или минимум: необходимое условие не является достаточным. Поэтому после решения системы Лагранжа всегда нужна классификация кандидатов.</p><a href="#geometry">Вернуться к геометрическому выводу <span aria-hidden="true">↗</span></a></div>
</div></section>

`;
