/* Single source of English translations for text rendered by all three scenes.
   Russian remains the canonical authored copy, with formulas shared verbatim.
   The runtime translates text nodes, attributes, dynamic HTML and SVG without
   recreating any interactive component or changing camera/model state. */
const lines = String.raw\`
Метод множителей Лагранжа|The Method of Lagrange Multipliers
Метод Лагранжа|Lagrange Multipliers
Множители Лагранжа|Lagrange Multipliers
Геометрия оптимизации|Geometry of Optimization
Геометрия допустимого движения|Geometry of Feasible Motion
Геометрия ограниченной оптимизации|Geometry of Constrained Optimization
Интерактивная математическая статья|An Interactive Mathematics Article
Оптимизация с ограничениями · интерактивный разбор|Constrained Optimization · An Interactive Lesson
Маршрут|Learning path
Три связанные демонстрации · от первого примера к границам метода|Three connected explorations · from the first example to the method's limitations
Три интерактивные сцены|Three interactive demonstrations
От прямой подстановки к геометрии|From substitution to geometry
Автономная работа без сети|Works offline
Версия|Version
· один автономный HTML|· one self-contained HTML file
Перейти к статье|Skip to the article
Разделы статьи|Article sections
Демонстрация|Presentation
Вернуться к чтению|Return to reading
1 / 3 · Поверхность и подстановка|1 / 3 · Surface and substitution
2 / 3 · Геометрический вывод|2 / 3 · Geometric derivation
3 / 3 · Кандидаты и контрпример|3 / 3 · Candidates and counterexample
← Назад|← Back
Далее →|Next →
← Предыдущий шаг|← Previous step
Далее: Правило цепочки →|Next: Chain rule →
Далее: Проекция градиента →|Next: Gradient projection →
Далее: Условие Лагранжа →|Next: Lagrange condition →
← / → — шаги · 1, 2, 3 — положения · R — вид · Esc — чтение|← / → — steps · 1, 2, 3 — positions · R — camera · Esc — reading
Клавиши|Keyboard
← / → — этапы · 1–3 — точки · R — камера · Esc — чтение|← / → — stages · 1–3 — points · R — camera · Esc — reading
01 · Допустимая кривая|01 · Feasible curve
02 · Градиенты и касание|02 · Gradients and tangency
03 · Необходимость и достаточность|03 · Necessary versus sufficient
01|01
02|02
03|03
Допустимое движение|Feasible motion
Допустимая кривая|Feasible curve
Градиенты и касание|Gradients and tangency
Кандидаты и контрпример|Candidates and counterexample
Следующий вопрос|Next question
Проверим границы метода|Testing the limits of the method
Что мы установили|What we have established
Вернуться к геометрическому выводу|Return to the geometric derivation
Применим условие к параболоиду|Apply the condition to the paraboloid
Линии уровня и условие Лагранжа|Level sets and the Lagrange condition
Стационарные точки: максимум, минимум или ни то ни другое|Stationary points: maxima, minima, or neither
Когда условие Лагранжа не гарантирует экстремум|When the Lagrange condition does not guarantee an extremum
Классификация четырёх стационарных точек (рисунок 3)|Classifying the four stationary points (Figure 3)
Четыре стационарные точки: тип и высота|Four stationary points: type and height
Классификация стационарных точек|Classification of stationary points
Экстремум при ограничении|Extrema under a constraint
Допустимое движение по поверхности|Feasible motion on the surface
Высота вдоль допустимой кривой|Height along a feasible curve
Почему градиенты становятся параллельны?|Why do the gradients become parallel?
Из допустимого движения — к условию Лагранжа|From feasible motion to the Lagrange condition
Условие как вычислительная система|The condition as a system of equations
Зачем нужна регулярность|Why regularity matters
Почему позже понадобится другой метод?|Why do we need a different method?
Подстановка как параметризация|Substitution as a parametrization
От частных производных к производной вдоль кривой|From partial derivatives to differentiation along a curve
Первое решение: исключим переменную|First solution: eliminate a variable
Подставим производные|Substitute the derivatives
Выразим координаты через множитель|Express coordinates in terms of the multiplier
От кандидата к глобальному максимуму|From a candidate to the global maximum
Лагранжиан: короткая запись системы|The Lagrangian: a compact formulation
Необходимость и достаточность|Necessity and sufficiency
Несколько ограничений|Multiple constraints
Что утверждает теорема|What the theorem states
Ещё один пример: расстояние до прямой|Another example: distance to a line
Почему глобальные экстремумы существуют|Why global extrema exist
Дополнительный пример: стационарная точка без экстремума|Further example: a stationary point without an extremum
Стационарная точка без экстремума|Stationary point without an extremum
Стационарная точка, не экстремум.|A stationary point, not an extremum.
стационарная точка перегиба профиля|stationary inflection point of the constrained profile
стaционарная точка перегиба профиля|stationary inflection point of the constrained profile
Локальный, не глобальный максимум|Local, but not global, maximum
Глобальный максимум|Global maximum
Глобальный минимум|Global minimum
Стационарные точки|Stationary points
Экстремумы|Extrema
Условие|Condition
Условие Лагранжа|Lagrange condition
Условие Лагранжа получено|Lagrange condition derived
Рис. 1 · Поверхность и высота на допустимой прямой|Fig. 1 · Surface and height along the feasible line
Рис. 2 · Линии уровня, допустимое направление и производная|Fig. 2 · Level sets, feasible direction, and derivative
Рис. 3 · Экстремумы на окружности|Fig. 3 · Extrema on the circle
Поверхность|Surface
Линии уровня|Level sets
Прямая и|Line and
Сейчас|Current
Область графика|Plot view
Обозначение|Notation
Профиль|Profile
Профиль высоты|Height profile
Высота|Height
Высота на допустимой прямой:|Height along the feasible line:
Высота вдоль допустимой прямой:|Height along the feasible line:
Высота для другой функции|Height for the alternative function
Высота вдоль допустимой кривой|Height along the feasible curve
Кривая пересечения и текущая точка|Intersection curve and current point
Цилиндр, пересечение и окружность|Cylinder, intersection, and circle
Координатные сечения|Coordinate sections
Параметр|Parameter
Угол|Angle
Положение точки|Point position
Положение точки:|Point position:
Точка|Point
Шаг|Step
из 4:|of 4:
Тип|Type
Производная|Derivative
Производная по направлению|Directional derivative
Норма проекции|Projection norm
Коэффициент при|Coefficient of
Градиент|Gradient
Градиенты|Gradients
— градиент|— gradient
— градиент ограничения|— constraint gradient
— касательный вектор|— tangent vector
— проекция|— projection
Сейчас|Current
Что показать на графике|Show on the plot
Выберите точку на окружности|Choose a point on the circle
Ракурс камеры|Camera view
Вернуть ракурс|Reset camera view
Вид сверху|Top view
Сечение|Section view
По x|Along x
По y|Along y
Оба|Both
Сбросить|Reset
Показать ограничение|Show constraint
Точно в максимум|At the maximum
До максимума:|Before the maximum:
В максимуме:|At the maximum:
После максимума:|After the maximum:
Локальный максимум · 0|Local maximum · 0
Глобальный максимум · 1|Global maximum · 1
Глобальный максимум · 2|Global maximum · 2
Максимум · y = 1|Maximum · y = 1
Минимум · y > 0|Minimum · y > 0
Минимум · y < 0|Minimum · y < 0
Стационарная точка · t = 0|Stationary point · t = 0
Вблизи стационарной точки|Near the stationary point
Вся окружность|Full circle
Вернуться к исходной функции|Return to the original function
Показать случай без экстремума|Show a case without an extremum
Проверить контрпример:|Explore the counterexample:
Достаточно ли стационарности для экстремума?|Is stationarity sufficient for an extremum?
Дополнительный опыт: достаточно ли условия|Further exploration: is the condition
для экстремума?|sufficient for an extremum?
Классифицируем кандидатов второй производной.|Classify the candidates using the second derivative.
Знак производной|Sign of the derivative
Правило цепочки|Chain rule
Проекция градиента|Gradient projection
Условие распадается на|The condition factors as
Основная функция:|Original objective:
Исходная функция:|Original objective:
Изменена только целевая функция:|Only the objective function has changed:
. Ограничение прежнее:|. The constraint is unchanged:
Линии уровня (2D) ↗|Level sets (2D) ↗
Поверхность (3D) ↗|Surface (3D) ↗
Схематический вид без вращения. Точные значения — в профиле.|Schematic static view. Exact values are shown in the profile.
WebGL недоступен. Схематическая проекция; профиль и управление работают.|WebGL is unavailable. A schematic projection is shown; the height profile and controls remain interactive.
Показан гладкий диск поверхности вокруг окружности|A smooth disk of the surface around the circle is shown
Его высота — точное значение целевой функции|Its height equals the exact objective value
Мышь — поворот · колесо — масштаб|Drag to rotate · scroll to zoom
Оси x, y, z показаны в одном масштабе|The x, y, z axes use the same scale
Масштаб высоты сжат: z × 0,48|Vertical scale compressed: z × 0.48
Камера меняет только ракурс.|The camera changes only the viewing angle.
Масштаб и положение графика|Plot zoom and position
Исходный вид|Reset view
Отдалить график|Zoom out
Приблизить график|Zoom in
Переключить математическую геометрию и профиль высоты|Switch between the geometry and the height profile
Переключить режим чтения и демонстрации|Switch between reading and presentation modes
Область просмотра графика высоты|Height profile viewing range
Положение камеры|Camera position
Положение точки и ограничение|Point position and constraint
Положение точки относительно максимума|Point position relative to the maximum
Пошаговый математический вывод|Step-by-step mathematical derivation
Прогресс математического вывода|Progress of the derivation
Выбор координатного сечения|Select a coordinate section
Точки выбранной функции|Points of the selected objective function
Характерные точки на окружности|Distinguished points on the circle
Допустимая окружность в плоскости x y. Точку можно перетаскивать по окружности.|Feasible circle in the xy-plane. Drag the point along the circle.
Линии уровня и допустимая прямая. Стрелки двигают область графика, плюс и минус меняют масштаб, Home восстанавливает исходный вид. Колесо мыши приближает, перетаскивание фона перемещает область, перетаскивание точки изменяет параметр. Масштабы осей равны.|Level sets and feasible line. Arrow keys pan, plus and minus zoom, Home resets the view. The mouse wheel zooms; drag the background to pan, or the point to change the parameter. Both axes use the same scale.
Профиль высоты вдоль допустимой кривой. Для изменения точки используйте ползунок или перетаскивание.|Height along the feasible curve. Adjust the parameter using the slider or by dragging.
Схематическое пространственное представление поверхности и допустимой траектории|Schematic spatial depiction of the surface and feasible curve
Увеличенный профиль высоты от минус 0,85 до плюс 0,85 радиана. Слева от нуля высота отрицательна, справа положительна, производная в нуле равна нулю. Точка перед нулём соответствует концу предыдущего оборота. График можно перетаскивать.|Enlarged height profile from −0.85 to +0.85 radians. Height is negative to the left of zero and positive to the right, while the derivative at zero vanishes. Negative angles correspond to the end of the previous revolution. The plot is draggable.
\`;
export const en = Object.freeze(Object.fromEntries(
  lines.trim().split("\n").map(line => {
    const at = line.indexOf("|");
    if(at < 1) throw new Error("Invalid translation row: " + line);
    return [line.slice(0,at).trim(),line.slice(at+1).trim()];
  })
));
export const metadata = Object.freeze({
 ru: { title: "Метод множителей Лагранжа — интерактивная геометрия", description: "Интерактивный учебник по методу множителей Лагранжа: допустимое движение, касание и градиенты, кандидаты и контрпример." },
 en: { title: "The Method of Lagrange Multipliers — Interactive Geometry", description: "An interactive lesson on Lagrange multipliers: feasible motion, tangency and gradients, stationary candidates, and a counterexample." }
});
