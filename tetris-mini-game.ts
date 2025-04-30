/* ------------------------------------------------------------------
 * --  _____       ______  _____                                    -
 * -- |_   _|     |  ____|/ ____|                                   -
 * --   | |  _ __ | |__  | (___    Institute of Embedded Systems    -
 * --   | | | '_ \|  __|  \___ \   Zurich University of             -
 * --  _| |_| | | | |____ ____) |  Applied Sciences                 -
 * -- |_____|_| |_|______|_____/   8401 Winterthur, Switzerland     -
 * ------------------------------------------------------------------
 * --
 * -- File:	    tetris-mini-game.ts
 * -- Project:  micro:bit InES Matrix
 * -- Date:	    11.04.2025
 * -- Author:   hesu
 * --
 * ------------------------------------------------------------------
 */


namespace lumaMatrix {

    /**
     * Fully implemented Tetris Mini game for an 8x8 LED matrix.
     * Warning: Place only initialization block and this block at the start and do not implement other code.
     */
    //% blockId="ZHAW_Game_TetrisMini"
    //% block="tetris mini game"
    //% subcategory="Games"
    export function tetrisMini(): void {
        control.inBackground(() => {
            const tetrisGame = new TetrisMiniGame();
            basic.pause(1);
            if (!tetrisGame) {
                serialDebugMsg("TetrisMiniGame: Critical Error - Failed to create tetrisGame object");
                basic.pause(1000 * 1000000); // This should never happen if so we do not continue and wait for a long time (1000000 seconds)
            } else {
                serialDebugMsg("TetrisMiniGame: tetrisGame object initialized successfully");
            }
        });
    }

    class TetrisMiniGame {
        private _matrix: any;
        private grid: number[][] = []; // matrixWidth x matrixHeight grid
        private currentPiece: number[][] = []; // Current falling piece
        private piecePosition: { x: number, y: number } = { x: Math.floor(matrixWidth / 2), y: 0 }; // Position of the piece
        private gameInterval: number = 700; // Game update interval in milliseconds
        private moveCooldown: number = 160; // Cooldown for joystick input
        private isGameOver: boolean = false;
        private score: number = 0; // Game score

        constructor() {
            this._matrix = strip;
            this.initializeMatrix();
            this.initializeGrid();
            this.spawnPiece();
            this.startGameLoop();
            this.handleUserInput();
        }

        /* Initialize the LED matrix for the game
         * Sets brightness and clears display */
        private initializeMatrix(): void {
            if (!this._matrix) {
                this._matrix = strip;
                if (!this._matrix) {
                    serialDebugMsg("TetrisMiniGame: Error: Matrix is undefined");
                    return;
                }
            }
            this._matrix.setBrightness(currentBrightness);
            this._matrix.clear();
            this._matrix.show();
            this.isGameOver = false;
            serialDebugMsg("TetrisMiniGame: Matrix initialized");
        }

        /* Create empty game grid as 2D array
         * All cells initialized to 0 (empty) */
        private initializeGrid(): void {
            for (let y = 0; y < matrixHeight; y++) {
                this.grid[y] = [];
                for (let x = 0; x < matrixWidth; x++) {
                    this.grid[y][x] = 0;
                }
            }
            serialDebugMsg("TetrisMiniGame: initializeGrid completed");
        }

        /* Create a new random Tetris piece at the top of the grid
         * Different shapes: Square, T-shape, Line-4, Line-3, Line-2, Z-shape, S-shape */
        private spawnPiece(): void {
            const pieces = [
                [[1, 1], [1, 1]],       // Square
                [[1, 1, 1], [0, 1, 0]], // T-shape
                [[1, 1, 1, 1]],         // Line-4
                [[1, 1, 1]],            // Line-3
                [[1, 1]],               // Line-2
                [[1, 1, 0], [0, 1, 1]], // Z-shape
                [[0, 1, 1], [1, 1, 0]]  // S-shape
            ];
            this.currentPiece = pieces[Math.randomRange(0, pieces.length - 1)];
            this.piecePosition = { x: Math.floor(matrixWidth / 2) - 1, y: 0 };
            serialDebugMsg("TetrisMiniGame: New piece spawned");
        }

        /* Draw the complete game grid to the LED matrix
         * Shows placed blocks (blue) and current piece (red) */
        private drawGrid(): void {
            this._matrix.clear();
            for (let y = 0; y < matrixHeight; y++) {
                for (let x = 0; x < matrixWidth; x++) {
                    if (this.grid[y][x] === 1) {
                        this.setPixel(x, y, neopixel.colors(NeoPixelColors.Blue));
                    }
                }
            }
            this.drawPiece();
            this._matrix.show();
        }

        /* Draw the current falling piece on the LED matrix
         * Uses red color to distinguish from placed blocks */
        private drawPiece(): void {
            for (let y = 0; y < this.currentPiece.length; y++) {
                for (let x = 0; x < this.currentPiece[y].length; x++) {
                    if (this.currentPiece[y][x] === 1) {
                        const px = this.piecePosition.x + x;
                        const py = this.piecePosition.y + y;
                        if (px >= 0 && px < matrixWidth && py >= 0 && py < matrixHeight) {
                            this.setPixel(px, py, neopixel.colors(NeoPixelColors.Red));
                        }
                    }
                }
            }
        }

        /* Set a single pixel on the LED matrix with bounds checking */
        private setPixel(x: number, y: number, color: number): void {
            if (!this._matrix) {
                serialDebugMsg("TetrisMiniGame: Error - Matrix object is not initialized");
                return;
            }
            if (x >= 0 && x < matrixWidth && y >= 0 && y < matrixHeight) {
                this._matrix.setPixelColor(y * matrixWidth + x, color);
            }
        }

        /* Try to move the current piece by the given offsets
         * Returns true if movement was successful, false if blocked */
        private movePiece(dx: number, dy: number): boolean {
            const newPosition = { x: this.piecePosition.x + dx, y: this.piecePosition.y + dy };
            if (this.isValidPosition(newPosition, this.currentPiece)) {
                this.piecePosition = newPosition;
                return true;
            }
            return false;
        }

        /* Check if the piece can exist at the given position
         * Validates against borders and existing blocks */
        private isValidPosition(position: { x: number, y: number }, piece: number[][] = this.currentPiece): boolean {
            for (let y = 0; y < piece.length; y++) {
                for (let x = 0; x < piece[y].length; x++) {
                    if (piece[y][x] === 1) {
                        const px = position.x + x;
                        const py = position.y + y;
                        if (px < 0 || px >= matrixWidth || py >= matrixHeight || (py >= 0 && this.grid[py][px] === 1)) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        /* Fix the current piece in place on the grid
         * Called when piece can't move down any further */
        private lockPiece(): void {
            for (let y = 0; y < this.currentPiece.length; y++) {
                for (let x = 0; x < this.currentPiece[y].length; x++) {
                    if (this.currentPiece[y][x] === 1) {
                        const px = this.piecePosition.x + x;
                        const py = this.piecePosition.y + y;
                        if (px >= 0 && px < matrixWidth && py >= 0 && py < matrixHeight) {
                            this.grid[py][px] = 1;
                        }
                    }
                }
            }
            serialDebugMsg("TetrisMiniGame: Piece locked in place");
        }

        /* Check for and remove completed rows
         * Shifts all rows above down by one space */
        private clearRows(): void {
            let clearedRows = 0;
            for (let y = 0; y < matrixHeight; y++) {
                if (this.grid[y].every(cell => cell === 1)) {
                    this.grid.splice(y, 1);
                    this.grid.unshift([]);
                    for (let x = 0; x < matrixWidth; x++) {
                        this.grid[0][x] = 0;
                    }
                    clearedRows++;
                    serialDebugMsg("TetrisMiniGame: Row cleared");
                }
            }
            
            /* Update score with bonus for multiple rows cleared at once. */
            if (clearedRows > 0) {
                /* Award bonus points for multiple rows cleared at once (1, 3, 5, 8 points). */
                const scoreAddition = clearedRows === 1 ? 1 : 
                                     clearedRows === 2 ? 3 : 
                                     clearedRows === 3 ? 5 : 8;
                this.score += scoreAddition;
                serialDebugMsg("TetrisMiniGame: Score: " + this.score);
            }
        }

        /* Rotate the current piece 90 degrees clockwise
         * Returns true if rotation was successful, false if blocked */
        private rotatePiece(): boolean {
            const newPiece: number[][] = [];
            for (let colIndex = 0; colIndex < this.currentPiece[0].length; colIndex++) {
                const newRow: number[] = [];
                for (let rowIndex = this.currentPiece.length - 1; rowIndex >= 0; rowIndex--) {
                    newRow.push(this.currentPiece[rowIndex][colIndex]);
                }
                newPiece.push(newRow);
            }
            if (this.isValidPosition(this.piecePosition, newPiece)) {
                this.currentPiece = newPiece;
                return true;
            }
            return false;
        }

        /* Main game loop update function
         * Handles piece falling, locking, and spawning new pieces */
        private updateGame(): void {
            if (this.isGameOver) return;
            if (!this._matrix) {
                serialDebugMsg("TetrisMiniGame: Error - Matrix object is not initialized");
                return;
            }
            if (!this.movePiece(0, 1)) {
                this.lockPiece();
                this.clearRows();
                this.spawnPiece();
                if (!this.isValidPosition(this.piecePosition, this.currentPiece)) {
                    serialDebugMsg("TetrisMiniGame: No valid position for new piece - Game Over");
                    this.gameOver();
                }
            }
            this.drawGrid();
        }

        /* Reset all game state to start a new game */
        private restartGame(): void {
            this.isGameOver = false;
            this.grid = [];
            this.initializeGrid();
            this.piecePosition = { x: Math.floor(matrixWidth / 2) - 1, y: 0 };
            this.spawnPiece();
            this.drawGrid();
            serialDebugMsg("TetrisMiniGame: Game restarted");
        }

        /* Handle end of game state
         * Shows game over message and score, then restarts */
        private gameOver(): void {
            this.isGameOver = true;
            serialDebugMsg("TetrisMiniGame: Game Over with score " + this.score);
            
            /* Display game over and score. */
            if (this.score < 10) { // Regular game over for normal scores
                scrollText("Game Over", neopixel.colors(NeoPixelColors.White), 90);
                scrollText("" + this.score, neopixel.colors(NeoPixelColors.Blue), 85);
            } else { // Special animation for high scores
                scrollText("High Score!", neopixel.colors(NeoPixelColors.White), 90);
                scrollText("" + this.score, neopixel.colors(NeoPixelColors.Yellow), 85);
                movingImage(
                    matrix8x8(`
                        . . . . . . . .
                        # # # # # # # #
                        . # # # # # # .
                        . . # # # # . .
                        . . . # # . . .
                        . . . # # . . .
                        . . . # # . . .
                        . . # # # # . .
                        `),
                    0xffff00,
                    10,
                    eDirection.Right
                );
            }
            
            // Reset the score when restarting
            this.score = 0;
            this.restartGame();
        }

        /* Start the main game update loop in background */
        private startGameLoop(): void {
            control.inBackground(() => {
                while (true) {
                    this.updateGame();
                    basic.pause(this.gameInterval);
                }
            });
        }

        /* Handle joystick input for piece movement and rotation
         * Uses state tracking to prevent multiple rotations on a single press */
        private handleUserInput(): void {
            control.inBackground(() => {
                /* Separate tracking for movement and rotation. */
                let lastMoveTime = 0;
                let rotationState = "READY"; // States: READY, PRESSED, WAITING_RELEASE
                
                while (true) {
                    const joystickDirection = readJoystick();
                    const currentTime = control.millis();
                    
                    /* Handle movement (left/right/down) with cooldown. */
                    if (currentTime - lastMoveTime > this.moveCooldown) {
                        if (joystickDirection === eJoystickDirection.Left) {
                            if (this.movePiece(-1, 0)) {
                                lastMoveTime = currentTime;
                                serialDebugMsg("TetrisMiniGame: Moved left");
                            }
                        } else if (joystickDirection === eJoystickDirection.Right) {
                            if (this.movePiece(1, 0)) {
                                lastMoveTime = currentTime;
                                serialDebugMsg("TetrisMiniGame: Moved right");
                            }
                        } else if (joystickDirection === eJoystickDirection.Up) {
                            if (this.movePiece(0, 1)) {
                                lastMoveTime = currentTime;
                                serialDebugMsg("TetrisMiniGame: Moved down");
                            }
                        }
                    }
                    
                    /* Handle rotation with state machine approach. This was needed as a simple cooldown could not fix buggy Joystick. */
                    if (joystickDirection === eJoystickDirection.Down || 
                        joystickDirection === eJoystickDirection.Center) {
                        
                        if (rotationState === "READY") {
                            /* Button just pressed - perform rotation once. */
                            if (this.rotatePiece()) {
                                serialDebugMsg("TetrisMiniGame: Rotated piece");
                            }
                            rotationState = "WAITING_RELEASE";
                        }
                        /* Otherwise we're already in WAITING_RELEASE state, do nothing. */
                        
                    } else {
                        /* Button released, reset to READY state. */
                        rotationState = "READY";
                    }
                    
                    /* Short pause between input reads. */
                    basic.pause(pollingInterval);
                }
            });
        }
    }
}