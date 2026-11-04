export const opening = String.raw`
<a class="skip" href="#problem">Перейти к статье</a>
<header class="masthead"><a class="masthead-brand" href="#top">Метод Лагранжа</a><div class="masthead-controls"><label class="chapter-select-label" for="chapter-select"><span class="sr-only">Выберите демонстрацию</span><select id="chapter-select" aria-label="Выберите демонстрацию"><option value="surface">01 · Допустимая кривая</option><option value="geometry">02 · Градиенты и касание</option><option value="cylinder">03 · Необходимость и достаточность</option></select></label><div class="language-switch" role="group" aria-label="Язык сайта"><button type="button" data-language="ru" aria-pressed="true">RU</button><button type="button" data-language="en" aria-pressed="false">EN</button></div></div></header>
<main id="top">
<header class="hero"><div class="eyebrow">Оптимизация с ограничениями · интерактивный разбор</div><h1>Метод множителей Лагранжа</h1><p class="lead">Как искать экстремум, когда точка обязана оставаться на кривой? Сначала решим задачу подстановкой, затем увидим роль касательного направления и выведем условие на градиенты. Наконец, проверим, почему одного этого условия недостаточно.</p><p class="hero-meta">Три связанные демонстрации · от первого примера к границам метода</p></header>


<section id="problem" class="reading"><div class="section-head"><span class="section-number">§ 1</span><div><h2>Экстремум при ограничении</h2><p class="section-deck">Ищем максимум не на всей плоскости, а только среди точек, удовлетворяющих ограничению.</p></div></div>
<p>Рассмотрим задачу</p>
<div class="intro-equation"><div class="equation" data-tex="\max f(x,y),\qquad f(x,y)=5-(x-3)^2-2(y-2)^2,"></div><div class="equation" data-tex="x+y=3."></div></div>
<p>Поскольку <span data-tex="5-(x-3)^2-2(y-2)^2\le5"></span>, на всей плоскости максимум равен <span data-tex="5"></span> и достигается при <span data-tex="(x,y)=(3,2)"></span>. Но <span data-tex="3+2\ne3"></span>: эта точка не лежит на заданной прямой и не может быть ответом.</p>
<p>Значит, нужно искать максимум <em>на прямой</em>, а не на всей поверхности. Сначала решим задачу привычной подстановкой.</p>
<h3>Первое решение: исключим переменную</h3><p>Поскольку <span data-tex="x+y=3"></span>, можно положить <span data-tex="y=3-x"></span>. Подставим в ту же целевую функцию:</p><div class="equation" data-tex="h(x)=f(x,3-x)=5-(x-3)^2-2(1-x)^2=-3x^2+10x-6."></div><p>Осталась квадратичная функция одной переменной. Найдём её вершину через производную:</p><div class="equation" data-tex="h'(x)=-6x+10=0\ \Longrightarrow\ x^*=\frac53,\quad y^*=3-x^*=\frac43,\quad h(x^*)=\frac73."></div><p>Итак, максимум на прямой равен <span data-tex="\frac73"></span>. Передвиньте точку на графике ниже: её высота меняется по той самой функции <span data-tex="h"></span>, которую мы только что нашли.</p>
</section>

<section id="surface" class="section"><div class="reading"><div class="section-head"><span class="section-number">I</span><div><h2>Допустимое движение по поверхности</h2><p class="section-deck">Как выглядит максимум, если разрешено двигаться только вдоль заданной прямой?</p></div></div>
<p data-i18n-context="plane">В плоскости <span data-tex="xy"></span> ограничение <span data-tex="x+y=3"></span> задаёт прямую. Вертикальная плоскость через неё вырезает на параболоиде допустимую пространственную кривую.</p><p class="scene-direction"><strong>Попробуйте:</strong> включите «Показать ограничение» и перемещайте точку. Сравните её высоту на поверхности с положением маркера на профиле справа.</p></div>
<div id="scene-one" class="scene" data-scene="1"></div>
<div class="reading">
<h3>Подстановка как параметризация</h3><p data-i18n-context="parameter-intro">В подстановке мы свободно выбирали <span data-tex="x"></span>, а затем находили <span data-tex="y=3-x"></span>. Назовём выбранное число <span data-tex="t"></span>. Параметризация — это способ сопоставить каждому <span data-tex="t"></span> точку прямой. Мы могли бы оставить букву <span data-tex="x"></span>; новая запись лишь удобнее для геометрического вывода. Сам метод Лагранжа явной параметризации не требует.</p><p>Параметризация прямой автоматически выполняет ограничение:</p>
<div class="equation" data-tex="r(t)=(t,3-t),\qquad g(r(t))=t+(3-t)=3."></div>
<p>Поднимая точку <span data-tex="r(t)"></span> на поверхность, получаем пространственную кривую и функцию её высоты:</p>
<div class="equation" data-tex="\Gamma(t)=\bigl(t,3-t,f(t,3-t)\bigr),"></div>
<div class="equation" data-tex="h(t)=f(r(t))=5-(t-3)^2-2(1-t)^2=-3t^2+10t-6."></div>
<p class="observation">Мы уже нашли максимум этой функции высоты <span data-tex="h(t)"></span> на допустимой прямой. Ползунок показывает лишь отрезок <span data-tex="0\le t\le3"></span>; сама прямая не имеет концов, поэтому математически <span data-tex="t\in\mathbb R"></span>.</p>

<aside class="math-note"><h3>Почему позже понадобится другой метод?</h3><p>Для окружности <span data-tex="x^2+y^2=1"></span> исключение переменной даёт две ветви <span data-tex="y=\pm\sqrt{1-x^2}"></span>. Параметризация <span data-tex="r(t)=(\cos t,\sin t)"></span> охватывает окружность одной формулой. Исключение переменной тоже работает, но требует исследовать обе ветви и их концы. Для более сложных ограничений нам нужно условие без такой подстановки. Выведем его на знакомом параболоиде.</p></aside><h3>От частных производных к производной вдоль кривой</h3>
<p data-i18n-context="partials">Частные производные отвечают на два раздельных вопроса: как меняется высота при движении вдоль оси <span data-tex="x"></span> при фиксированном <span data-tex="y"></span> и вдоль оси <span data-tex="y"></span> при фиксированном <span data-tex="x"></span>. В 3D-сцене включите «Сечение по x» и «Сечение по y», чтобы увидеть эти наклоны отдельно.</p>
<div class="equation" data-tex="C_x'(x_0)=(1,0,f_x(P)),\qquad C_y'(y_0)=(0,1,f_y(P))."></div>
<p>Эти векторы касаются пространственных сечений графика. Градиент <span data-tex="\nabla f=(f_x,f_y)"></span>, напротив, лежит в плоскости аргументов и не является касательной к поверхности.</p>
<p data-i18n-context="differential">На допустимой прямой при увеличении <span data-tex="t"></span> имеем <span data-tex="dx=dt"></span> и <span data-tex="dy=-dt"></span>. Поэтому полный дифференциал даёт</p>
<div class="equation" data-tex="dh=f_x\,dx+f_y\,dy=(f_x-f_y)\,dt,\qquad h'(t)=f_x-f_y."></div>
<p>Теперь запишем то же равенство через градиент и направление вдоль прямой.</p>
<div class="chapter-transition"><span class="transition-kicker">Следующий вопрос</span><p>Мы нашли максимум вдоль допустимой кривой. Как увидеть его через направление градиента, не исключая переменную?</p><a href="#geometry">02 · Линии уровня и условие Лагранжа <span aria-hidden="true">→</span></a></div>
</div></section>
`;

export const ending = `<footer class="footer"><span>Метод множителей Лагранжа<br>Геометрия ограниченной оптимизации</span><span>Версия <code id="build-id"></code> · один автономный HTML</span></footer></main>`;
