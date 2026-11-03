export const opening = String.raw`
<a class="skip" href="#problem">Перейти к статье</a>
<header class="masthead"><a href="#top">Геометрия оптимизации</a><nav aria-label="Разделы статьи"><a href="#surface">Траектория</a><a href="#geometry">Условие</a><a href="#calculation">Вычисление</a><a href="#cylinder">Кандидаты</a></nav></header>
<main id="top">
<header class="hero"><div class="eyebrow">Интерактивная математическая статья</div><h1>Множители Лагранжа</h1><p class="lead">Условие <span data-tex="\nabla f=\lambda\nabla g"></span> возникает потому, что в условном экстремуме исчезает изменение функции вдоль допустимой кривой. Проследим этот переход от геометрии поверхности до вычислительной системы.</p><div class="meta"><span>Три связанные сцены</span><span>Один геометрический вывод</span><span>Автономная работа без сети</span></div></header>

<section id="problem" class="reading"><div class="section-head"><span class="section-number">§ 1</span><div><h2>Экстремум на подмножестве</h2><p class="section-deck">Ограничение меняет не формулу функции, а направления, в которых разрешено сравнивать её значения.</p></div></div>
<p>Рассмотрим задачу</p>
<div class="intro-equation"><div class="equation" data-tex="\max f(x,y),\qquad f(x,y)=5-(x-3)^2-2(y-2)^2,"></div><div class="equation" data-tex="x+y=3."></div></div>
<p>На всей плоскости функция имеет единственный максимум в вершине параболоида: условия <span data-tex="f_x=f_y=0"></span> дают точку <span data-tex="(3,2)"></span> и значение <span data-tex="5"></span>. Но <span data-tex="3+2\ne3"></span>, поэтому вершина не принадлежит допустимому множеству.</p>
<p>Добавить уравнение <span data-tex="x+y=3"></span> к условиям <span data-tex="f_x=f_y=0"></span> недостаточно. Равенство <span data-tex="\nabla f=0"></span> требует отсутствия изменения первого порядка во всех направлениях плоскости. Условный экстремум требует меньшего: изменение должно исчезнуть лишь в направлениях, которые остаются внутри ограничения.</p>
<p>Здесь можно подставить <span data-tex="y=3-x"></span> и получить задачу одной переменной. Эта проверка полезна, но она скрывает геометрию и плохо переносится на ограничения, которые неудобно разрешать относительно одной координаты. Вместо этого будем работать с допустимой кривой как с самостоятельным геометрическим объектом.</p>
</section>

<section id="surface" class="section"><div class="reading"><div class="section-head"><span class="section-number">I</span><div><h2>Высота вдоль допустимой траектории</h2><p class="section-deck">Пересечение поверхности с вертикальной плоскостью превращает условную задачу в исследование одной пространственной кривой.</p></div></div>
<p>Уравнение <span data-tex="x+y=3"></span> задаёт прямую в плоскости <span data-tex="xy"></span> и вертикальную плоскость в пространстве <span data-tex="xyz"></span>. Только точки пересечения этой плоскости с графиком <span data-tex="z=f(x,y)"></span> допустимы.</p><p>Включите ограничение, затем проведите точку по профилю. Оранжевые маркеры в трёхмерной сцене и на графике <span data-tex="h"></span> описывают одну и ту же допустимую точку.</p></div>
<div id="scene-one" class="scene" data-scene="1"></div>
<div class="reading">
<p>Параметризация прямой автоматически выполняет ограничение:</p>
<div class="equation" data-tex="r(t)=(t,3-t),\qquad g(r(t))=t+(3-t)=3."></div>
<p>Поднимая точку <span data-tex="r(t)"></span> на поверхность, получаем пространственную траекторию и её высоту:</p>
<div class="equation" data-tex="\Gamma(t)=\bigl(t,3-t,f(t,3-t)\bigr),"></div>
<div class="equation" data-tex="h(t)=f(r(t))=5-(t-3)^2-2(1-t)^2=-3t^2+10t-6."></div>
<p class="observation">Исходная задача теперь звучит точно: найти экстремум высоты <span data-tex="h(t)"></span> вдоль допустимой траектории. Диапазон ползунка <span data-tex="0\le t\le3"></span> выбран для исследования сцены; математически допустимая прямая соответствует всем <span data-tex="t\in\mathbb R"></span>.</p>

<h3>От частных производных к изменению вдоль пути</h3>
<p>Частные производные отвечают на два раздельных вопроса: как меняется высота при движении вдоль оси <span data-tex="x"></span> при фиксированном <span data-tex="y"></span> и вдоль оси <span data-tex="y"></span> при фиксированном <span data-tex="x"></span>. Режим координатных сечений показывает эти два наклона на поверхности.</p>
<div class="equation" data-tex="C_x'(x_0)=(1,0,f_x(P)),\qquad C_y'(y_0)=(0,1,f_y(P))."></div>
<p>Эти векторы касаются пространственных сечений графика. Градиент <span data-tex="\nabla f=(f_x,f_y)"></span>, напротив, лежит в плоскости аргументов и не является касательной к поверхности.</p>
<p>На допустимой прямой при увеличении <span data-tex="t"></span> имеем <span data-tex="dx=dt"></span> и <span data-tex="dy=-dt"></span>. Поэтому полный дифференциал даёт</p>
<div class="equation" data-tex="dh=f_x\,dx+f_y\,dy=(f_x-f_y)\,dt,\qquad h'(t)=f_x-f_y."></div>
<p>Следующий шаг состоит в том, чтобы прочитать это равенство геометрически — как скалярное произведение градиента с допустимым направлением.</p>
</div></section>
`;

export const ending = `<footer class="footer"><span>Множители Лагранжа<br>Геометрия допустимого движения</span><span>Версия <code id="build-id"></code> · один автономный HTML</span></footer></main>`;
