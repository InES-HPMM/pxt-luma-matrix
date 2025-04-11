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
            basic.pause(100);
            if (!tetrisGame) {
                serialDebugMsg("TetrisMiniGame: Error - tetrisGame object is not initialized");
            } else {
                serialDebugMsg("TetrisMiniGame: tetrisGame object initialized successfully");
            }
        });
    }

    class TetrisMiniGame { // TODO add game score
        private _matrix: any;
        private grid: number[][] = []; // matrixWidth x matrixHeight grid
        private currentPiece: number[][] = []; // Current falling piece
        private piecePosition: { x: number, y: number } = { x: Math.floor(matrixWidth / 2), y: 0 }; // Position of the piece
        private gameInterval: number = 700; // Game update interval in milliseconds
        private moveCooldown: number = 100; // Cooldown for joystick input
        private isGameOver: boolean = false;

        constructor() {
            this._matrix = strip;
            this.initializeMatrix();
            this.initializeGrid();
            this.spawnPiece();
            this.startGameLoop();
            this.handleUserInput();
        }

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
        }

        private initializeGrid(): void {
            for (let y = 0; y < matrixHeight; y++) {
                this.grid[y] = [];
                for (let x = 0; x < matrixWidth; x++) {
                    this.grid[y][x] = 0;
                }
            }
            serialDebugMsg("TetrisMiniGame: initializeGrid completed");
        }

        private spawnPiece(): void {
            const pieces = [
                [[1, 1], [1, 1]],       // Square
                [[1, 1, 1], [0, 1, 0]], // T-shape
                [[1, 1, 1, 1]],         // Line
                [[1, 1, 0], [0, 1, 1]], // Z-shape
                [[0, 1, 1], [1, 1, 0]]  // S-shape
            ];
            this.currentPiece = pieces[Math.randomRange(0, pieces.length - 1)];
            this.piecePosition = { x: Math.floor(matrixWidth / 2) - 1, y: 0 };
        }

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

        private setPixel(x: number, y: number, color: number): void {
            if (x >= 0 && x < matrixWidth && y >= 0 && y < matrixHeight) {
                this._matrix.setPixelColor(y * matrixWidth + x, color);
            }
        }

        private movePiece(dx: number, dy: number): boolean {
            const newPosition = { x: this.piecePosition.x + dx, y: this.piecePosition.y + dy };
            if (this.isValidPosition(newPosition, this.currentPiece)) { // Explicitly pass this.currentPiece
                this.piecePosition = newPosition;
                return true;
            }
            return false;
        }

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
        }

        private clearRows(): void {
            for (let y = 0; y < matrixHeight; y++) {
                if (this.grid[y].every(cell => cell === 1)) {
                    this.grid.splice(y, 1);
                    this.grid.unshift([]);
                    for (let x = 0; x < matrixWidth; x++) {
                        this.grid[0][x] = 0;
                    }
                }
            }
        }

        private rotatePiece(): void {
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
            }
        }

        private updateGame(): void {
            if (this.isGameOver) return;
            if (!this.movePiece(0, 1)) {
                this.lockPiece();
                this.clearRows();
                this.spawnPiece();
                if (!this.isValidPosition(this.piecePosition, this.currentPiece)) { // Explicitly pass this.currentPiece
                    this.gameOver();
                }
            }
            this.drawGrid();
        }

        private restartGame(): void {
            // Reset game state
            this.isGameOver = false;
            this.grid = [];
            this.initializeGrid();
            this.piecePosition = { x: Math.floor(matrixWidth / 2) - 1, y: 0 };
            this.spawnPiece();
            this.drawGrid();
        }

        private gameOver(): void {
            this.isGameOver = true;
            scrollText("Game Over", neopixel.colors(NeoPixelColors.White), 90);
            this.restartGame();
        }

        private startGameLoop(): void {
            control.inBackground(() => {
                while (true) {
                    this.updateGame();
                    basic.pause(this.gameInterval);
                }
            });
        }

        private handleUserInput(): void {
            control.inBackground(() => {
                // Track the last direction to prevent repeated moves
                let lastDirection = eJoystickDirection.NotPressed;
                // Add cooldown tracking
                let lastMoveTime = 0;
                
                while (true) {
                    const joystickDirection = readJoystick();
                    const currentTime = control.millis();
                    
                    // Only process input if it's different from last direction or enough time has passed
                    if ((joystickDirection !== lastDirection || 
                         (currentTime - lastMoveTime > this.moveCooldown)) && 
                         joystickDirection !== eJoystickDirection.NotPressed) {
                        
                        switch (joystickDirection) {
                            case eJoystickDirection.Left:
                                if (this.movePiece(-1, 0)) {
                                    lastMoveTime = currentTime;
                                }
                                break;
                            case eJoystickDirection.Right:
                                if (this.movePiece(1, 0)) {
                                    lastMoveTime = currentTime;
                                }
                                break;
                            case eJoystickDirection.Down:
                                if (this.movePiece(0, 1)) {
                                    lastMoveTime = currentTime;
                                }
                                break;
                            case eJoystickDirection.Up:
                            case eJoystickDirection.Center: // Allow center button to rotate too
                                this.rotatePiece();
                                lastMoveTime = currentTime;
                                break;
                        }
                        
                        // Update last direction after processing
                        lastDirection = joystickDirection;
                    }
                    
                    // Reset last direction when joystick is released
                    if (joystickDirection === eJoystickDirection.NotPressed) {
                        lastDirection = eJoystickDirection.NotPressed;
                    }
                    
                    basic.pause(pollingInterval);
                }
            });
        }
    }
}