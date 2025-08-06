const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const rows = 50;
const cols = 50;
const cellSize = canvas.width / cols;
const startButton = document.querySelector('.buttons button:first-child');
const resetButton = document.querySelector('.buttons button:last-child');

let isMouseDown = false;
let lastCell = null;

let isRunning = false;
let grid = new Array(rows);
for (let i = 0; i < rows; i++) {
  grid[i] = new Array(cols);
}

startButton.addEventListener('click', toggleStart);
resetButton.addEventListener('click', resetGrid);

canvas.addEventListener('mousedown', (e) => {
    isMouseDown = true;
    drawOnCanvas(e);
});

canvas.addEventListener('mouseup', () => {
    isMouseDown = false;
    lastCell = null;
});

canvas.addEventListener('mouseleave', () => {
    isMouseDown = false;
    lastCell = null;
});


canvas.addEventListener('mousemove', (e) => {
    if (isMouseDown) {
        drawOnCanvas(e);
    }
});

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
        this.w = 0;
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
            grid[y][x].w = 10 * Math.random();
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
    node.f = node.g + 3*node.h;
    console.log(node.f, node.g, node.h);
}

let interval;

function aStar() {
    startNode.g = 0;
    updateNode(startNode);
    isRunning = true;
    startButton.textContent = 'Pause';
    interval = setInterval(step, 1);
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
            isRunning = false;
            startButton.textContent = 'Start';
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

            let G = current.g + current.w;

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
        isRunning = false;
        startButton.textContent = 'Start';
        console.log("No path found!");
    }
}

function toggleStart() {
    if (!isRunning) {
        if (unexplored.length === 0) {
            resetGrid();
        }
        aStar();
    } else {
        clearInterval(interval);
        isRunning = false;
        startButton.textContent = 'Resume';
    }
}

function resetGrid() {
    clearInterval(interval);
    isRunning = false;
    startButton.textContent = 'Start';
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    addNodes();
    
    startNode = grid[0][0];
    endNode = grid[rows - 1][cols - 1];
    
    unexplored = [startNode];
    explored = [];
    
    drawGrid();
    drawNode(startNode, "blue", true);
    drawNode(endNode, "red", true);
}

function drawOnCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const col = Math.floor(mouseX / cellSize);
    const row = Math.floor(mouseY / cellSize);

    if(col >= 0 && col < cols && row >= 0 && row < rows) {
        const clickedNode = grid[row][col];
        
        if (!lastCell || lastCell !== clickedNode) {
            lastCell = clickedNode;
            toggleWall(clickedNode);
        }
    }
}


function toggleWall(node) {
    if ((node === startNode) || (node === endNode)) return;
    
    node.wall = !node.wall;
    
    if (node.wall) {
        drawNode(node, "black");
    } else {
        drawNode(node, "white", true);
    }
}

function drawNode(node, color, withStroke = false) {
    ctx.fillStyle = color;
    ctx.globalAlpha = 1;
    ctx.fillRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);

    if (withStroke) {
        ctx.strokeStyle = "black";
        ctx.strokeRect(node.x * cellSize, node.y * cellSize, cellSize, cellSize);
    }
}

drawGrid();
drawNode(startNode, "blue", true);
drawNode(endNode, "red", true);
