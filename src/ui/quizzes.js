
const questions = [
  {
    anchor: "#geometry > .reading:last-child",
    title: "Должен ли градиент целевой функции обращаться в ноль при условном максимуме?",
    choices: [
      ["Да", false, "Нет: изменяться может высота в недопустимых направлениях."],
      ["Нет", true, "Верно: достаточно исчезновения производной вдоль допустимого касательного направления."]
    ]
  },
  {
    anchor: "#cylinder > .reading:last-child",
    title: "Если производная вдоль ограничения равна нулю, экстремум уже доказан?",
    choices: [
      ["Да", false, "Нет: это лишь необходимое условие стационарности; нужен дополнительный анализ."],
      ["Нет", true, "Верно: пример с sin³ t имеет горизонтальную касательную, но меняет знак около нуля."]
    ]
  }
];
export function initQuestions() {
  questions.forEach((q, n) => {
    const host = document.querySelector(q.anchor);
    if (!host) return;
    const aside = document.createElement("aside");
    aside.className = "understanding-check";
    aside.innerHTML = `<h3>Проверка понимания (по желанию)</h3><p>${q.title}</p>
       <div class="control-buttons" role="group" aria-label="Варианты ответа"></div>
       <p class="understanding-feedback" aria-live="polite"></p>`;
    const controls = aside.querySelector(".control-buttons");
    q.choices.forEach(([label, correct, feedback]) => {
      const button = document.createElement("button");
      button.textContent = label;
      button.type = "button";
      button.onclick = () => {
        controls.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b === button)));
        aside.querySelector(".understanding-feedback").textContent = feedback;
      };
      controls.append(button);
    });
    host.append(aside);
  });
}
