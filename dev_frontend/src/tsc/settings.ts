// Define settings object to hold current values
interface GameSettings {
  paddleSize: number;
  ballSize: number;
  paddleColor: string;
  ballColor: string;
  language: string;
}

export const settings: GameSettings = {
  paddleSize: 5,
  ballSize: 5,
  paddleColor: "#ffffff",
  ballColor: "#ffffff",
  language: "en",
};

// Utility to update displayed values
function updateDisplay(id: string, value: string) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// Paddle Size
const paddleSlider = document.getElementById("paddle-size") as HTMLInputElement;
paddleSlider?.addEventListener("input", () => {
  settings.paddleSize = parseInt(paddleSlider.value);
  updateDisplay("paddle-size-value", settings.paddleSize.toString());
  console.log("Paddle speed:", settings.paddleSize);
});

// Ball Size
const ballSlider = document.getElementById("ball-size") as HTMLInputElement;
ballSlider?.addEventListener("input", () => {
  settings.ballSize = parseInt(ballSlider.value);
  updateDisplay("ball-size-value", settings.ballSize.toString());
  console.log("Ball size:", settings.ballSize);
});

// Paddle color selection
document.querySelectorAll<HTMLElement>("[data-pdl-color]").forEach(div => {
  div.addEventListener("click", () => {
    document.querySelectorAll("[data-bg-color]").forEach(d => d.classList.remove("ring", "ring-white"));
    div.classList.add("ring", "ring-white");
    settings.paddleColor = div.dataset.pdlColor ?? settings.paddleColor;
    console.log("Paddle color selected:", settings.paddleColor);
  });
});

// Ball color selection
document.querySelectorAll<HTMLElement>("[data-ball-color]").forEach(div => {
  div.addEventListener("click", () => {
    document.querySelectorAll("[data-ball-color]").forEach(d => d.classList.remove("ring", "ring-white"));
    div.classList.add("ring", "ring-white");
    settings.ballColor = div.dataset.ballColor ?? settings.ballColor;
    console.log("Ball color selected:", settings.ballColor);
  });
});

// Language selection
document.querySelectorAll<HTMLElement>("[data-lang]").forEach(img => {
  img.addEventListener("click", () => {
    document.querySelectorAll("[data-lang]").forEach(i => i.classList.remove("ring", "ring-white"));
    img.classList.add("ring", "ring-white");
    settings.language = img.dataset.lang ?? settings.language;
    console.log("Language selected:", settings.language);
  });
});
