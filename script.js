let numNonBombs = 0

document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("minesweeper-container");
    createGrid(container)
    findAllBombs()
});

function createGrid(container) {
    let numBombs = 0

    // Define the size of the grid
    const rows = 10;
    const cols = 10;
    // Create grid
    for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
            const cell = document.createElement("div");
            cell.addEventListener("click", (event) => { handleCellClick(cell, event) })
            cell.addEventListener("contextmenu", (event) => { handleCellClick(cell, event) })
            cell.classList.add("cell");
            cell.textContent = ""
            const hasBomb = randomizeBomb()
            container.appendChild(cell);

            // Add coordinates
            cell.dataset.col = row
            cell.dataset.row = col

            cell.dataset.numTouchingBombs = 0

            // Add bomb
            if (hasBomb) {
                numBombs++
                cell.dataset.isBomb = true
            }
        }
    }

    numNonBombs = (rows * cols) - numBombs

}

function randomizeBomb() {
    // Generate a random number between 0 and 1
    const randomValue = Math.random();

    // Check if the random number is less than or equal to 0.1 (10% probability)
    return randomValue <= 0.05;
}

function revealCell(cell) {

    if (cell.dataset.isBomb) {
        cell.textContent = "@"
        cell.classList.add("potential-bomb")
        handleBombClick()
    } else {

        // Prevent clicking same cell multiple times.
        const hasBeenClicked = cell.classList.contains("empty")

        if (cell.dataset.numTouchingBombs == "0") {
            revealNeighbors(cell);
        } else {
            numNonBombs--
            cell.textContent = cell.dataset.numTouchingBombs
        }

    }
    cell.classList.add('empty')
}

function markAsPotentialBomb(cell) {
    if (!cell.classList.contains("empty")) {
        cell.classList.toggle("potential-bomb")
    }
}

function handleCellClick(cell, event) {
    event.preventDefault()
    console.log(event.type)

    if (event.type == "click") {
        revealCell(cell)
    }
    else if (event.type == "contextmenu") {
        markAsPotentialBomb(cell)
    }

    if (numNonBombs <= 0) {
        revealAllCells()
        setTimeout(() => showGameOverMessage("You win!"), 100)
    }
}

function handleBombClick() {
    setTimeout(() => showGameOverMessage("Game Over. You suck."), 100)
}

function findAllBombs() {
    const selector = `.cell[data-is-bomb="true"]`;
    const bombs = document.querySelectorAll(selector)

    bombs.forEach(bomb => {
        incrementNeighbours(bomb)
    })
}

function incrementNeighbours(bomb) {
    const bombCol = Number(bomb.dataset.col)
    const bombRow = Number(bomb.dataset.row)

    const relativePositions = [
        { col: 0, row: -1 }, // Top
        { col: -1, row: -1 }, // Top-left
        { col: -1, row: 0 }, // Left
        { col: -1, row: 1 }, // Bottom-left
        { col: 0, row: 1 }, // Bottom
        { col: 1, row: 1 }, // Bottom-right
        { col: 1, row: 0 }, // Right
        { col: 1, row: -1 } // Top-right
    ];

    relativePositions.forEach(position => {
        const neighborCol = bombCol + position.col
        const neighborRow = bombRow + position.row
        const isValid = isValidCoordinate(neighborRow, neighborCol)

        if (isValid) {
            // FIXME: Not properly fetching cells, or incorrectly incrementing numberOfBombs.
            const selector = `.cell[data-col="${neighborCol}"][data-row="${neighborRow}"]`;
            const cell = document.querySelector(selector)
            cell.dataset.numTouchingBombs = Number(cell.dataset.numTouchingBombs) + 1
        }
    })
}

function isValidCoordinate(row, col) {
    const maxCols = 10
    const maxRows = 10
    return col >= 0 && col < maxCols && row >= 0 && row < maxRows
}

function revealNeighbors(cell) {
    const queue = [];
    const col = Number(cell.dataset.col);
    const row = Number(cell.dataset.row);
    const processedCells = new Set();

    const relativePositions = [
        { col: 0, row: -1 }, // Top
        { col: -1, row: -1 }, // Top-left
        { col: -1, row: 0 }, // Left
        { col: -1, row: 1 }, // Bottom-left
        { col: 0, row: 1 }, // Bottom
        { col: 1, row: 1 }, // Bottom-right
        { col: 1, row: 0 }, // Right
        { col: 1, row: -1 } // Top-right
    ];

    queue.push({ col, row });

    while (queue.length > 0) {
        const currentCell = queue.shift();
        const currentCol = currentCell.col;
        const currentRow = currentCell.row;

        const selector = `.cell[data-col="${currentCol}"][data-row="${currentRow}"]`;
        const currentNeighbor = document.querySelector(selector);

        if (currentNeighbor && !currentNeighbor.classList.contains("empty")) {
            if (!processedCells.has(`${currentCol}-${currentRow}`)) {
                currentNeighbor.classList.add("empty");
                processedCells.add(`${currentCol}-${currentRow}`);

                if (currentNeighbor.dataset.numTouchingBombs == "0") {
                    relativePositions.forEach(position => {
                        const neighborCol = currentCol + position.col;
                        const neighborRow = currentRow + position.row;

                        if (isValidCoordinate(neighborRow, neighborCol)) {
                            queue.push({ col: neighborCol, row: neighborRow });
                        }
                    });
                } else {
                    currentNeighbor.textContent = currentNeighbor.dataset.numTouchingBombs;
                }

                // Decrement the number of available non-bomb cells.
                numNonBombs--;
            }
        }
    }

    console.log(`numNonBombs: ${numNonBombs}`)
}

function showGameOverMessage(message) {
    alert(`${message} Play again?`)
    resetGame()
}

function resetGame() {
    const container = document.getElementById("minesweeper-container");
    container.innerHTML = ""; // Clear the container
    createGrid(container);
    findAllBombs();
}

function revealAllCells() {
    const allCells = document.querySelectorAll(".cell");
    allCells.forEach((cell) => {
        if (cell.dataset.isBomb) {
            cell.classList.add("potential-bomb")
            cell.textContent = "@"
        }
        if (!cell.classList.contains("empty")) {
            cell.classList.add('empty')
        }
    });
}