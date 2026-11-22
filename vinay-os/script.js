// VINAY_OS: interactive profile terminal + mini Snake arcade.
const output = document.getElementById("terminal-output");
const terminalForm = document.getElementById("terminal-form");
const terminalInput = document.getElementById("terminal-input");

function addTerminalLine(content, className = "") {
  const p = document.createElement("p");
  if (className) p.className = className;
  p.innerHTML = content;
  output.appendChild(p);
  output.scrollTop = output.scrollHeight;
}

const commands = {
  help: () => `Available commands:<br>about&nbsp;&nbsp;&nbsp;&nbsp; About Vinay<br>missions&nbsp; Explore current projects<br>skills&nbsp;&nbsp;&nbsp; View technology areas<br>contact&nbsp;&nbsp; Show contact links<br>game&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Jump to the arcade<br>clear&nbsp;&nbsp;&nbsp;&nbsp; Clear the terminal`,
  about: () => `I'm Vinay M., a Computer Science undergraduate at Gopalan College of Engineering and Management. I'm interested in AI engineering, backend development, SaaS and autonomous agents.`,
  missions: () => `ACTIVE MISSIONS:<br>[01] ESGIntells — AI-powered ESG report analysis and risk intelligence.<br>[02] Autonomous Agents — exploring tool-using AI systems.<br>[03] Engineering Fundamentals — DSA and core CS practice.`,
  skills: () => `TECH AREAS:<br>Languages: Python, JavaScript, C<br>Web/backend: HTML, CSS, Node.js, Express, FastAPI<br>AI/data: NLP, LLMs, Machine Learning, SQL<br>Tools: Git, GitHub, Docker, Linux, AWS`,
  contact: () => `OPEN CHANNELS:<br>GitHub: github.com/vinay2005-lab<br>LinkedIn: linkedin.com/in/vinaym2005/<br>Email: update the email link on this page with your address.`,
  game: () => { document.getElementById("arcade").scrollIntoView({behavior:"smooth"}); return "Loading arcade module... Use START / RESTART to play."; },
  clear: () => { output.innerHTML = ""; return null; }
};

terminalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const raw = terminalInput.value.trim();
  if (!raw) return;
  const command = raw.toLowerCase();
  addTerminalLine(`<span class="prompt">visitor@vinay-os:~$</span> ${escapeHTML(raw)}`);
  if (command === "clear") {
    commands.clear();
  } else if (commands[command]) {
    addTerminalLine(commands[command](), "terminal-response");
  } else {
    addTerminalLine(`Command not found: ${escapeHTML(raw)}. Type <b>help</b> to see available commands.`, "terminal-response");
  }
  terminalInput.value = "";
});
function escapeHTML(value) {
  return value.replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}

// Snake game
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best-score");
const messageEl = document.getElementById("game-message");
const startButton = document.getElementById("start-game");

const cell = 20;
const cells = canvas.width / cell;
let snake, food, direction, nextDirection, score, timer, running = false;
let best = Number(localStorage.getItem("vinayOsSnakeBest") || 0);
bestEl.textContent = String(best).padStart(3, "0");

function resetGame() {
  snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
  direction = {x:1,y:0};
  nextDirection = {...direction};
  score = 0;
  scoreEl.textContent = "000";
  placeFood();
  drawGame();
}
function placeFood() {
  do {
    food = {x:Math.floor(Math.random()*cells),y:Math.floor(Math.random()*cells)};
  } while (snake.some(part => part.x === food.x && part.y === food.y));
}
function drawGame() {
  ctx.fillStyle = "#0a1219";
  ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle = "rgba(0,240,255,.055)";
  ctx.lineWidth = 1;
  for(let i=0;i<=cells;i++){
    ctx.beginPath();ctx.moveTo(i*cell,0);ctx.lineTo(i*cell,canvas.height);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,i*cell);ctx.lineTo(canvas.width,i*cell);ctx.stroke();
  }
  if (food) {
    ctx.fillStyle = "#ff36d1";
    ctx.shadowColor = "#ff36d1";ctx.shadowBlur = 14;
    ctx.fillRect(food.x*cell+5,food.y*cell+5,cell-10,cell-10);
    ctx.shadowBlur = 0;
  }
  snake.forEach((part,index)=>{
    ctx.fillStyle = index===0 ? "#00f0ff" : "#087f8a";
    ctx.shadowColor = index===0 ? "#00f0ff" : "transparent";
    ctx.shadowBlur = index===0 ? 12 : 0;
    ctx.fillRect(part.x*cell+2,part.y*cell+2,cell-4,cell-4);
  });
  ctx.shadowBlur = 0;
}
function endGame() {
  running = false;
  clearInterval(timer);
  messageEl.textContent = `SYSTEM FAILURE — final score: ${score}. Press start to retry.`;
  if(score > best){
    best = score;
    localStorage.setItem("vinayOsSnakeBest", String(best));
    bestEl.textContent = String(best).padStart(3,"0");
  }
}
function tick() {
  direction = {...nextDirection};
  const head = {x:snake[0].x+direction.x,y:snake[0].y+direction.y};
  const eating = head.x===food.x && head.y===food.y;
  const bodyToCheck = eating ? snake : snake.slice(0,-1);
  if(head.x<0 || head.y<0 || head.x>=cells || head.y>=cells ||
     bodyToCheck.some(part=>part.x===head.x && part.y===head.y)){
    endGame();return;
  }
  snake.unshift(head);
  if(eating){
    score += 10;
    scoreEl.textContent = String(score).padStart(3,"0");
    placeFood();
  } else {
    snake.pop();
  }
  drawGame();
}
function startGame() {
  clearInterval(timer);
  resetGame();
  running = true;
  messageEl.textContent = "RUNNING — collect the data nodes!";
  timer = setInterval(tick, 115);
}
function changeDirection(key) {
  const map = {
    ArrowUp:{x:0,y:-1},w:{x:0,y:-1},
    ArrowDown:{x:0,y:1},s:{x:0,y:1},
    ArrowLeft:{x:-1,y:0},a:{x:-1,y:0},
    ArrowRight:{x:1,y:0},d:{x:1,y:0}
  };
  const candidate = map[key];
  if(!candidate || !running) return;
  if(candidate.x === -direction.x && candidate.y === -direction.y) return;
  nextDirection = candidate;
}
document.addEventListener("keydown",(event)=>{
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(event.key)){
    event.preventDefault();
  }
  changeDirection(event.key);
});
document.querySelectorAll("[data-dir]").forEach(button=>{
  button.addEventListener("click",()=>{
    const dirs = {up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"};
    changeDirection(dirs[button.dataset.dir]);
  });
});
startButton.addEventListener("click",startGame);
resetGame();
messageEl.textContent = "Press start, then use arrow keys or WASD.";
