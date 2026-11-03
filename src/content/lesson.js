export const opening = String.raw`
<a class="skip" href="#problem">Перейти к статье</a>
<header class="masthead"><a href="#top">Геометрия оптимизации</a><nav aria-label="Разделы статьи"><a href="#surface">Допустимая кривая</a><a href="#geometry">Условие</a><a href="#calculation">Вычисление</a><a href="#cylinder">Экстремумы</a></nav></header>
<main id="top">
<header class="hero"><div class="eyebrow">Интерактивная математическая статья</div><h1>Множители Лагранжа</h1><p class="lead">Как найти максимум функции, если выбирать можно только точки на заданной кривой? Сначала решим простую задачу подстановкой, затем выясним, какое геометрическое условие позволяет обойтись без исключения переменных.</p><div class="meta"><span>От прямой подстановки к геометрии</span><span>Три интерактивные сцены</span><span>Автономная работа без сети</span></div></header>

<section id="problem" class="reading"><div class="section-head"><span class="section-number">§ 1</span><div><h2>Экстремум при ограничении</h2><p class="section-deck">Ищем максимум не на всей плоскости, а только среди точек, удовлетворяющих ограничению.</p></div></div>
<p>Рассмотрим задачу</p>
<div class="intro-equation"><div class="equation" data-tex="\max f(x,y),\qquad f(x,y)=5-(x-3)^2-2(y-2)^2,"></div><div class="equation" data-tex="x+y=3."></div></div>
<p>Поскольку <span data-tex="5-(x-3)^2-2(y-2)^2\le5"></span>, на всей плоскости максимум равен <span data-tex="5"></span> и достигается при <span data-tex="(x,y)=(3,2)"></span>. Но <span data-tex="3+2\ne3"></span>: эта точка не лежит на заданной прямой и не может быть ответом.</p>
<p>Значит, нужно искать максимум <em>на прямой</em>, а не на всей поверхности. Сначала решим задачу привычной подстановкой.</p>
<h3>Первое решение: исключим переменную</h3><p>Поскольку <span data-tex="x+y=3"></span>, можно положить <span data-tex="y=3-x"></span>. Подставим в ту же целевую функцию:</p><div class="equation" data-tex="h(x)=f(x,3-x)=5-(x-3)^2-2(1-x)^2=-3x^2+10x-6."></div><p>Осталась квадратичная функция одной переменной. Найдём её вершину через производную:</p><div class="equation" data-tex="h'(x)=-6x+10=0\ \Longrightarrow\ x^*=\frac53,\quad y^*=3-x^*=\frac43,\quad h(x^*)=\frac73."></div><p>Итак, максимум на прямой равен <span data-tex="\frac73"></span>. Передвиньте точку на графике ниже: её высота меняется по той самой функции <span data-tex="h"></span>, которую мы только что нашли.</p>
</section>

<section id="surface" class="section"><div class="reading"><div class="section-head"><span class="section-number">I</span><div><h2>Высота вдоль допустимой кривой</h2><p class="section-deck">Все допустимые точки на поверхности образуют одну кривую.</p></div></div>
<p>В плоскости <span data-tex="xy"></span> условие <span data-tex="x+y=3"></span> задаёт прямую. Проведём через неё вертикальную плоскость: она пересечёт параболоид по кривой, вдоль которой мы можем двигаться.</p><p>Нажмите «Показать ограничение» и перемещайте точку. Маркер на поверхности и маркер на графике высоты всегда соответствуют одной точке.</p></div>
<div id="scene-one" class="scene" data-scene="1"></div>
<div class="reading">
<h3>Подстановка как параметризация</h3><p>В подстановке мы свободно выбирали <span data-tex="x"></span>, а затем находили <span data-tex="y=3-x"></span>. Назовём выбранное число <span data-tex="t"></span>. Параметризация — это способ сопоставить каждому <span data-tex="t"></span> точку прямой. Мы могли бы оставить букву <span data-tex="x"></span>; новая запись лишь удобнее для геометрического вывода. Сам метод Лагранжа явной параметризации не требует.</p><p>Параметризация прямой автоматически выполняет ограничение:</p>
<div class="equation" data-tex="r(t)=(t,3-t),\qquad g(r(t))=t+(3-t)=3."></div>
<p>Поднимая точку <span data-tex="r(t)"></span> на поверхность, получаем пространственную кривую и функцию её высоты:</p>
<div class="equation" data-tex="\Gamma(t)=\bigl(t,3-t,f(t,3-t)\bigr),"></div>
<div class="equation" data-tex="h(t)=f(r(t))=5-(t-3)^2-2(1-t)^2=-3t^2+10t-6."></div>
<p class="observation">Мы уже нашли максимум этой функции высоты <span data-tex="h(t)"></span> на допустимой прямой. Ползунок показывает лишь отрезок <span data-tex="0\le t\le3"></span>; сама прямая не имеет концов, поэтому математически <span data-tex="t\in\mathbb R"></span>.</p>

<aside class="math-note"><h3>Почему позже понадобится другой метод?</h3><p>Для окружности <span data-tex="x^2+y^2=1"></span> исключение переменной даёт две ветви <span data-tex="y=\pm\sqrt{1-x^2}"></span>. Параметризация <span data-tex="r(t)=(\cos t,\sin t)"></span> охватывает окружность одной формулой. Исключение переменной тоже работает, но требует исследовать обе ветви и их концы. Для более сложных ограничений нам нужно условие без такой подстановки. Выведем его на знакомом параболоиде.</p></aside><h3>От частных производных к производной вдоль кривой</h3>
<p>Частные производные отвечают на два раздельных вопроса: как меняется высота при движении вдоль оси <span data-tex="x"></span> при фиксированном <span data-tex="y"></span> и вдоль оси <span data-tex="y"></span> при фиксированном <span data-tex="x"></span>. В 3D-сцене включите «Сечение по x» и «Сечение по y», чтобы увидеть эти наклоны отдельно.</p>
<div class="equation" data-tex="C_x'(x_0)=(1,0,f_x(P)),\qquad C_y'(y_0)=(0,1,f_y(P))."></div>
<p>Эти векторы касаются пространственных сечений графика. Градиент <span data-tex="\nabla f=(f_x,f_y)"></span>, напротив, лежит в плоскости аргументов и не является касательной к поверхности.</p>
<p>На допустимой прямой при увеличении <span data-tex="t"></span> имеем <span data-tex="dx=dt"></span> и <span data-tex="dy=-dt"></span>. Поэтому полный дифференциал даёт</p>
<div class="equation" data-tex="dh=f_x\,dx+f_y\,dy=(f_x-f_y)\,dt,\qquad h'(t)=f_x-f_y."></div>
<p>Теперь запишем то же равенство через градиент и направление вдоль прямой.</p>
</div></section>
`;

export const ending = `<footer class="footer"><span>Множители Лагранжа<br>Геометрия допустимого движения</span><span>Версия <code id="build-id"></code> · один автономный HTML</span></footer></main>`;
