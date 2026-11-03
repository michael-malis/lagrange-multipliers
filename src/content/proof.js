export const proofSteps = [
  {
    title: "1. Где заканчивается рост?",
    text: "Проведите точку от t = 1 через вершину профиля к t = 2. Производная меняет знак с плюса на минус. В локальном внутреннем экстремуме профиля она равна нулю.",
    formula: String.raw`h(t)=f(r(t)),\qquad h'(t_0)=0.`,
  },
  {
    title: "2. Производная в допустимом направлении",
    text: "Касательный вектор T = (1, −1) задаёт допустимое движение. Правило цепочки связывает его с градиентом. Положительное скалярное произведение означает рост высоты.",
    formula: String.raw`h'(t)=\nabla f(r(t))\cdot T=f_x-f_y.`,
    extra: String.raw`D_{\widehat T}f=\frac{h'(t)}{\sqrt2},\quad \widehat T=\frac{T}{\sqrt2}.`,
  },
  {
    title: "3. Исчезает проекция, а не градиент",
    text: "Наблюдайте, как касательная компонента сокращается, обращается в ноль и меняет направление. В точном максимуме ∇f = (8/3, 8/3) остаётся ненулевым, но перпендикулярен T.",
    formula: String.raw`\operatorname{proj}_{T}\nabla f=\frac{\nabla f\cdot T}{\|T\|^2}\,T.`,
    extra: String.raw`\nabla f(P^*)\cdot T=0\quad\Longrightarrow\quad \nabla f(P^*)\perp T.`,
  },
  {
    title: "4. Вторая нормаль к той же касательной",
    text: "На всём допустимом пути g(r(t)) = 3 постоянно. Его производная равна нулю, поэтому ∇g перпендикулярен T в каждой точке. В экстремуме эту же нормальную прямую занимает ∇f.",
    formula: String.raw`\frac{d}{dt}g(r(t))=\nabla g(r(t))\cdot T=0.`,
    extra: String.raw`\nabla g=(1,1)\ne0.`,
  },
  {
    title: "5. Почему появляется множитель",
    text: "Для f, g ∈ C¹ в окрестности регулярной точки P существует локальная параметризация r с r′ ≠ 0. В плоскости пространство нормалей к этой кривой одномерно. В локальном экстремуме оба градиента лежат в нём, а ∇g ≠ 0 его порождает.",
    formula: String.raw`\boxed{\nabla f(P)=\lambda\nabla g(P)},\qquad g(P)=c.`,
    extra: String.raw`\lambda\in\mathbb R,\qquad \nabla g(P)\ne0.`,
  },
];
export const geometry = String.raw`
<section id="geometry" class="section"><div class="reading"><div class="section-head"><span class="section-number">II</span><div><h2>Что именно обращается в ноль</h2><p class="timing">5:30–11:30 · Геометрический вывод</p></div></div><p>На виде сверху оранжевая прямая задаёт допустимое движение, синие эллипсы — линии уровня функции. Начните снова с <span data-tex="P=(1,2)"></span>. Последовательно раскройте пять шагов; каждый добавляет одну часть рассуждения.</p></div><div id="scene-two" class="scene" data-scene="2"></div><div class="reading"><p class="observation">Условие Лагранжа <strong>необходимо</strong> в регулярной точке локального условного экстремума. Оно даёт кандидатов: их ещё предстоит исследовать. При <span data-tex="\nabla g=0"></span> стандартная теорема неприменима; особенности и границы рассматривают отдельно.</p></div></section>`;
