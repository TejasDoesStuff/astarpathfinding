const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const rows = 15;
const cols = 15;
const cellSize = canvas.width / cols;
let grid = new Array(rows);
for (let i = 0; i < rows; i++) {
  grid[i] = new Array(cols);
}

function drawGrid() {
    for(let x = 0; x <= canvas.width; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for(let y = 0; y <= canvas.height; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.strokeStyle = "black";
    ctx.globalAlpha = 1;
    ctx.stroke();
}

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.g = 0;
        this.h = 0;
        this.f = 0;
        this.previous = undefined;
        this.neighbors = [];
        this.wall = false;
    }

    findNeighbors(grid) {
        let directions = [
            {x: 0, y: -1}, 
            {x: 1, y: 0}, 
            {x: 0, y: 1},
            {x: -1, y: 0}
        ];

        let x = this.x;
        let y = this.y;

        for (let dir of directions) {
            let newX = x + dir.x;
            let newY = y + dir.y;

            if (newX >= 0 && newX < cols && newY >= 0 && newY < rows) {
                this.neighbors.push(grid[newY][newX]);
            }
        }
    }
}

function addNodes() {
    for(let y = 0; y < rows; y++) {
        for(let x = 0; x < cols; x++) {
            let node = new Node(x, y);
            grid[y][x] = node;
        }
    }

    for(let y = 0; y < rows; y++) {
        for(let x = 0; x < cols; x++) {
            grid[y][x].findNeighbors(grid);
        }
    }
}

addNodes();

startNode = grid[0][0];
endNode = grid[rows - 1][cols - 1];

unexplored = [startNode];
explored = [];

function heuristic(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function updateNode(node) {
    node.h = heuristic(node, endNode);
    node.f = node.g + node.h;
    console.log(node.f, node.g, node.h);
}

let interval;

function aStar() {
    startNode.g = 0;
    updateNode(startNode);
    interval = setInterval(step, 5);
}

function step() {
    if (unexplored.length > 0) {
        unexplored.sort ((a, b) => a.f - b.f);
        let current = unexplored.shift();

        if(current === endNode) {
            console.log("Path found!");
            let pathNode = endNode;
            while (pathNode.previous) {
                if (pathNode !== startNode && pathNode !== endNode) {
                    drawNode(pathNode, "lime");
                }
                pathNode = pathNode.previous;
            }
            clearInterval(interval);
            return;
        }

        explored.push(current);
        if (current !== startNode && current !== endNode) {
            drawNode(current, "lightblue");
        }

        for(let n of current.neighbors) {
            if(n.wall || explored.includes(n)) {
                continue;
            }

            let G = current.g + 1;

            if (!unexplored.includes(n)) {
                n.g = G;
                updateNode(n);
                n.previous = current;
                unexplored.push(n);
                if (n !== startNode && n !== endNode) {
                    drawNode(n, "orange");
                }
            } else if (G < n.g) {
                n.g = G;
                updateNode(n);
                n.previous = current;
            }
        }
    }
    else {
        clearInterval(interval);
    }
}

function drawNode(node, color) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;
    ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
}

drawGrid();
drawNode(startNode, "blue");
drawNode(endNode, "red");
aStar();
