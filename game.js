document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let grid = [];
    let score = 0;
    let bestScore = localStorage.getItem('bestScore') || 0;
    let gameOver = false;
    
    // DOM elements
    const gridContainer = document.querySelector('.grid-container');
    const scoreElement = document.getElementById('score');
    const bestScoreElement = document.getElementById('best-score');
    const newGameButton = document.getElementById('new-game');
    const tryAgainButton = document.getElementById('try-again');
    const gameOverElement = document.getElementById('game-over');

    // Initialize the game
    function initGame() {
        // Clear the grid
        gridContainer.innerHTML = '';
        grid = Array(4).fill().map(() => Array(4).fill(0));
        score = 0;
        gameOver = false;
        updateScore();
        
        // Hide game over screen
        gameOverElement.style.display = 'none';
        
        // Create grid cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                gridContainer.appendChild(cell);
            }
        }
        
        // Add initial tiles
        addRandomTile();
        addRandomTile();
        
        // Update best score display
        bestScoreElement.textContent = bestScore;
    }
    
    // Add a random tile (2 or 4) to an empty cell
    function addRandomTile() {
        const emptyCells = [];
        
        // Find all empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            // Choose a random empty cell
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% chance for 2, 10% chance for 4
            grid[row][col] = Math.random() < 0.9 ? 2 : 4;
            
            // Create and animate the new tile
            createTile(row, col, grid[row][col], true);
        }
    }
    
    // Create a tile element
    function createTile(row, col, value, isNew = false) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${value}`;
        tile.textContent = value;
        tile.dataset.row = row;
        tile.dataset.col = col;
        tile.dataset.value = value;
        
        if (isNew) {
            tile.classList.add('new-tile');
        }
        
        // Position the tile
        updateTilePosition(tile, row, col);
        
        gridContainer.appendChild(tile);
        return tile;
    }
    
    // Update tile position
    function updateTilePosition(tile, row, col) {
        const cellSize = gridContainer.clientWidth / 4;
        const gap = 15;
        const size = cellSize - gap;
        
        tile.style.width = `${size}px`;
        tile.style.height = `${size}px`;
        tile.style.left = `${col * cellSize + gap/2}px`;
        tile.style.top = `${row * cellSize + gap/2}px`;
    }
    
    // Update score display
    function updateScore() {
        scoreElement.textContent = score;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bestScore', bestScore);
            bestScoreElement.textContent = bestScore;
        }
    }
    
    // Check if game is over
    function checkGameOver() {
        // Check for any empty cells
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] === 0) return false;
                
                // Check right neighbor
                if (j < 3 && grid[i][j] === grid[i][j + 1]) return false;
                
                // Check bottom neighbor
                if (i < 3 && grid[i][j] === grid[i + 1][j]) return false;
            }
        }
        
        return true;
    }
    
    // Handle keyboard input
    function handleKeyDown(e) {
        if (gameOver) return;
        
        let moved = false;
        
        switch (e.key) {
            case 'ArrowUp':
                moved = moveTiles('up');
                break;
            case 'ArrowDown':
                moved = moveTiles('down');
                break;
            case 'ArrowLeft':
                moved = moveTiles('left');
                break;
            case 'ArrowRight':
                moved = moveTiles('right');
                break;
            default:
                return; // Ignore other keys
        }
        
        if (moved) {
            // Add a new tile after a short delay to allow animations to complete
            setTimeout(() => {
                addRandomTile();
                
                // Check for game over
                if (checkGameOver()) {
                    gameOver = true;
                    gameOverElement.style.display = 'flex';
                }
            }, 150);
        }
    }
    
    // Move tiles in the specified direction
    function moveTiles(direction) {
        // Create a deep copy of the grid to compare later
        const previousGrid = JSON.parse(JSON.stringify(grid));
        
        // Remove all tiles from DOM (we'll recreate them with animations)
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => tile.remove());
        
        // Process the move based on direction
        switch (direction) {
            case 'up':
                moveUp();
                break;
            case 'down':
                moveDown();
                break;
            case 'left':
                moveLeft();
                break;
            case 'right':
                moveRight();
                break;
        }
        
        // Recreate all tiles with new positions/values
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] !== 0) {
                    createTile(i, j, grid[i][j]);
                }
            }
        }
        
        // Check if the grid changed
        return JSON.stringify(previousGrid) !== JSON.stringify(grid);
    }
    
    // Move tiles up
    function moveUp() {
        for (let j = 0; j < 4; j++) {
            let column = [];
            // Extract non-zero values from the column
            for (let i = 0; i < 4; i++) {
                if (grid[i][j] !== 0) {
                    column.push(grid[i][j]);
                }
            }
            
            // Merge tiles
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    score += column[i];
                    column.splice(i + 1, 1);
                }
            }
            
            // Update the grid
            for (let i = 0; i < 4; i++) {
                grid[i][j] = i < column.length ? column[i] : 0;
            }
        }
    }
    
    // Move tiles down
    function moveDown() {
        for (let j = 0; j < 4; j++) {
            let column = [];
            // Extract non-zero values from the column (bottom to top)
            for (let i = 3; i >= 0; i--) {
                if (grid[i][j] !== 0) {
                    column.push(grid[i][j]);
                }
            }
            
            // Merge tiles
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    score += column[i];
                    column.splice(i + 1, 1);
                }
            }
            
            // Update the grid
            for (let i = 0; i < 4; i++) {
                grid[3 - i][j] = i < column.length ? column[i] : 0;
            }
        }
    }
    
    // Move tiles left
    function moveLeft() {
        for (let i = 0; i < 4; i++) {
            let row = [];
            // Extract non-zero values from the row
            for (let j = 0; j < 4; j++) {
                if (grid[i][j] !== 0) {
                    row.push(grid[i][j]);
                }
            }
            
            // Merge tiles
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            
            // Update the grid
            for (let j = 0; j < 4; j++) {
                grid[i][j] = j < row.length ? row[j] : 0;
            }
        }
    }
    
    // Move tiles right
    function moveRight() {
        for (let i = 0; i < 4; i++) {
            let row = [];
            // Extract non-zero values from the row (right to left)
            for (let j = 3; j >= 0; j--) {
                if (grid[i][j] !== 0) {
                    row.push(grid[i][j]);
                }
            }
            
            // Merge tiles
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            
            // Update the grid
            for (let j = 0; j < 4; j++) {
                grid[i][3 - j] = j < row.length ? row[j] : 0;
            }
        }
    }
    
    // Handle touch events for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
    
    function handleTouchMove(e) {
        if (!touchStartX || !touchStartY) return;
        
        touchEndX = e.touches[0].clientX;
        touchEndY = e.touches[0].clientY;
        
        const diffX = touchStartX - touchEndX;
        const diffY = touchStartY - touchEndY;
        
        // Only process if the swipe is significant enough
        if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) return;
        
        // Determine the direction of the swipe
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > 0) {
                // Left swipe
                if (moveTiles('left')) {
                    e.preventDefault();
                    setTimeout(() => {
                        addRandomTile();
                        if (checkGameOver()) {
                            gameOver = true;
                            gameOverElement.style.display = 'flex';
                        }
                    }, 150);
                }
            } else {
                // Right swipe
                if (moveTiles('right')) {
                    e.preventDefault();
                    setTimeout(() => {
                        addRandomTile();
                        if (checkGameOver()) {
                            gameOver = true;
                            gameOverElement.style.display = 'flex';
                        }
                    }, 150);
                }
            }
        } else {
            // Vertical swipe
            if (diffY > 0) {
                // Up swipe
                if (moveTiles('up')) {
                    e.preventDefault();
                    setTimeout(() => {
                        addRandomTile();
                        if (checkGameOver()) {
                            gameOver = true;
                            gameOverElement.style.display = 'flex';
                        }
                    }, 150);
                }
            } else {
                // Down swipe
                if (moveTiles('down')) {
                    e.preventDefault();
                    setTimeout(() => {
                        addRandomTile();
                        if (checkGameOver()) {
                            gameOver = true;
                            gameOverElement.style.display = 'flex';
                        }
                    }, 150);
                }
            }
        }
        
        // Reset touch coordinates
        touchStartX = 0;
        touchStartY = 0;
        touchEndX = 0;
        touchEndY = 0;
    }
    
    // Event listeners
    document.addEventListener('keydown', handleKeyDown);
    newGameButton.addEventListener('click', initGame);
    tryAgainButton.addEventListener('click', initGame);
    
    // Touch event listeners for mobile
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Initialize the game
    initGame();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const tiles = document.querySelectorAll('.tile');
        tiles.forEach(tile => {
            updateTilePosition(tile, parseInt(tile.dataset.row), parseInt(tile.dataset.col));
        });
    });
});
