const canvas = document.getElementById("canvas");
canvas.width = visualViewport.width;
canvas.height = visualViewport.height - 10;
const c = canvas.getContext("2d");

//space between every vector in px
const step = 20;
//set complexity of perlin noise vector field
const zoomOut = Math.random() * 5 + 5;

//speed in pixles per second
const maxHorizontalSpeed = 50 / zoomOut + Math.random() * 15;
const maxVerticalSpeed = maxHorizontalSpeed;

//describres how much the effect of the vector field on
//the particules is dampened
const fieldDampening = 6 + Math.random() * 4;

//used to store every vector and particules values
let vectors = [];
let particules = [];

let i = 6.2 || Math.random() * 2 * Math.PI;
const initialI = i;
console.log(i);
c.fillStyle = "white";
c.fillRect(0, 0, canvas.width, canvas.height);

function drawVector(vector) {
    const { angle, x, y } = vector;
    const vectorLen = step;
    const xEnd = Math.cos(angle) * vectorLen + x;
    const yEnd = Math.sin(angle) * vectorLen + y;
    c.strokStyle = "blue";
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(xEnd, yEnd);
    c.stroke();
}

//creates vector using perlin noise
function createVector(x, y) {
    const angle =
        perlin.get(
            (x / canvas.width) * zoomOut,
            (y / canvas.height) * zoomOut
        ) *
        Math.PI *
        2.1;
    const vector = {
        angle: angle,
        x: x,
        y: y,
    };
    return vector;
}

//sets random seed to generate perlin noise
perlin.seed();

//generates a vector field using perlin noise
function CreateNewVectorField() {
    vectors = [];
    for (let x = 0; x < canvas.width; x += step)
        for (let y = 0; y < canvas.height; y += step) {
            const vector = createVector(x, y);
            vectors.push(vector);
            // drawVector(vector);
        }
}

CreateNewVectorField();

//constructor function for particule
function Particule(x, y, dx, dy, color) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.prevX = x;
    this.prevY = y;
    this.color = color || "#ff000003";

    this.update = () => {
        this.x += this.dx;
        this.y += this.dy;
    };
    this.teleport = () => {
        if (this.x < 0) (this.x = canvas.width), (this.prevX = this.x);
        if (this.x > canvas.width) (this.x = 0), (this.prevX = this.x);
        if (this.y < 0) (this.y = canvas.height), (this.prevY = this.y);
        if (this.y > canvas.height) (this.y = 0), (this.prevY = this.y);
    };
    //effect of the vector on particule trajectory
    this.vectorEffect = () => {
        const closesetVector = findClosestVector(this.x, this.y);
        if (!closesetVector) return;
        const { angle } = closesetVector;
        this.dx +=
            (Math.cos(angle) * maxHorizontalSpeed - this.dx) / fieldDampening;
        this.dy +=
            (Math.sin(angle) * maxVerticalSpeed - this.dy) / fieldDampening;
    };
    this.draw = () => {
        this.vectorEffect();
        this.update();
        this.teleport();
        c.strokeStyle = this.color;
        c.beginPath();
        c.moveTo(this.prevX, this.prevY);
        c.lineTo(this.x, this.y);
        c.stroke();
        this.prevX = this.x;
        this.prevY = this.y;
    };
}
//finds closest vector of flow field from x and y coord
function findClosestVector(x, y) {
    for (const vector of vectors) {
        const dist = Math.sqrt((vector.x - x) ** 2 + (vector.y - y) ** 2);
        if (dist <= (Math.sqrt(2) / 1.3) * step) return vector;
        if (vector == vectors[vectors.length]) return false;
    }
}
//creates a selected amount of particules and "throws" them on canvas
function throwParticules() {
    const particulesNb = 3000;
    for (let i = 0; i < particulesNb; i++) {
        const x = canvas.width / 4 + (Math.random() - 0.5) * 400;
        const y = canvas.height / 2 + (Math.random() - 0.5) * 400;
        const dx = (Math.random() - 0.5) * 2 * maxHorizontalSpeed;
        const dy = (Math.random() - 0.5) * 2 * maxVerticalSpeed;
        const particule = new Particule(x, y, dx, dy);
        particules.push(particule);
    }
}
throwParticules();

//700ms after nav showup,start to draw perlin noise flow field
setTimeout(() => {
    let interval = setInterval(frame, 50);
    //frame containes everything that is done every frame
    function frame() {
        for (const particule of particules)
            particule.draw(), (particule.color = rainbow());
        //after certain amount of time, stop drawing
        if (i - initialI > 2.5) clearInterval(interval);
    }
}, 100);

//increments i and outputs a color depending on it
function rainbow() {
    i += 0.000004;
    // if (i >= 255) i = 1;
    const r = Math.abs(Math.cos(i) - 0.2) * 200 + 55;
    const g = Math.abs(Math.cos(i + Math.PI / 3) - 0.2) * 200 + 55;
    const b = Math.abs(Math.cos(i + (2 * Math.PI) / 3) - 0.2) * 200 + 55;
    return `rgba(${r},${g}, ${b}, 0.015)`;
}

///////////////////buttons redirections//////////////////

const redirections = ["about", "skills", "work", "contact"];
for (const redirection of redirections) {
    const btn = document.getElementById(redirection + "-button");
    btn.onclick = () => document.location.replace(`/${redirection}`);
}
