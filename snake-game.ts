/* ------------------------------------------------------------------
 * --  _____       ______  _____                                    -
 * -- |_   _|     |  ____|/ ____|                                   -
 * --   | |  _ __ | |__  | (___    Institute of Embedded Systems    -
 * --   | | | '_ \|  __|  \___ \   Zurich University of             -
 * --  _| |_| | | | |____ ____) |  Applied Sciences                 -
 * -- |_____|_| |_|______|_____/   8401 Winterthur, Switzerland     -
 * ------------------------------------------------------------------
 * --
 * -- File:	    snake-game.ts
 * -- Project:  micro:bit InES Matrix
 * -- Date:	    08.01.2025
 * -- Author:   hesu, ebep
 * --
 * ------------------------------------------------------------------
 */
namespace lumaMatrix {

    /* Fully implemented hungry snake game with joystick controls.
     * Warning: Place only initialization block and this block at the start and do not implement other code. */
    //% blockId="ZHAW_Game_Snake"
    //% block="snake game"
    //% subcategory="Games"
    export function snake(): void {
        control.inBackground(() => {
            const snakeGame = new SnakeGame();
            basic.pause(1);
            if (!snakeGame) {
                serialDebugMsg("snake: Critical Error - Failed to create snakeGame object");
                basic.pause(1000 * 1000000); // This should never happen if so we do not continue and wait for a long time (1000000 seconds)
            } else {
                serialDebugMsg("snake: snakeGame object initialized successfully");
            }
        });
    }

    class SnakeGame {
        private _matrix: any;
        private snake: number[][] = [[3, 3]]; // Initial position of the snake
        private direction: eJoystickDirection = eJoystickDirection.Right;
        private food: number[] = [2, 2]; // Initial position of the food
        private gameInterval: number = 500; // Game update interval in milliseconds
        private isGameOver: boolean = false;
        private score: number = 0; // Score

        constructor() {
            this._matrix = strip;
            this.initializeMatrix();
            this.generateFood();
            this.drawSnake();
            this.drawFood();
            this._matrix.show();
            this.startGameLoop();
            this.handleUserInput();
        }

        /* Initialize the LED matrix for the game
         * Sets brightness and clears display. */
        private initializeMatrix(): void {
            if (!this._matrix) {
                this._matrix = strip;
            }
            this._matrix.setBrightness(currentBrightness);
            this._matrix.clear();
            this._matrix.show();
            serialDebugMsg("SnakeGame: Matrix initialized");
        }

        /* Set a single pixel on the LED matrix with bounds checking. */
        private setPixel(x: number, y: number, color: number): void {
            if (!this._matrix) {
                serialDebugMsg("SnakeGame: Error - Matrix object is not initialized");
                return;
            }
            if (x >= 0 && x < matrixWidth && y >= 0 && y < matrixHeight) {
                this._matrix.setPixelColor(y * matrixWidth + x, color);
            }
        }

        /* Draw the snake body on the LED matrix
         * Each segment appears as a green pixel. */
        private drawSnake(): void {
            for (let segment of this.snake) {
                this.setPixel(segment[0], segment[1], neopixel.colors(NeoPixelColors.Green));
            }
        }

        /* Draw the food item on the LED matrix
         * Food appears as a red pixel. */
        private drawFood(): void {
            this.setPixel(this.food[0], this.food[1], neopixel.colors(NeoPixelColors.Red));
        }

        /* Generate a new food item at a random position
         * Makes sure the food doesn't overlap with any snake segments. */
        private generateFood(): void {
            let x: number;
            let y: number;
            do {
                x = Math.randomRange(0, matrixWidth - 1);
                y = Math.randomRange(0, matrixHeight - 1);
            } while (this.snake.some(segment => segment[0] === x && segment[1] === y));
            this.food = [x, y];
            serialDebugMsg("SnakeGame: New food generated at " + x + "," + y);
        }

        /* Update the snake position based on current direction
         * Checks for collisions with walls, itself, and food. */
        private updateSnake(): void {
            let head = this.snake[0].slice();
            switch (this.direction) {
                case eJoystickDirection.Up:
                    head[1]++;
                    break;
                case eJoystickDirection.Down:
                    head[1]--;
                    break;
                case eJoystickDirection.Left:
                    head[0]--;
                    break;
                case eJoystickDirection.Right:
                    head[0]++;
                    break;
            }

            /* Check for collisions with walls. */
            if (head[0] < 0 || head[0] >= matrixWidth || head[1] < 0 || head[1] >= matrixHeight) {
                serialDebugMsg("SnakeGame: Hit wall - Game Over");
                this.gameOver();
                return;
            }

            /* Check for collisions with itself. */
            if (this.snake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
                serialDebugMsg("SnakeGame: Hit itself - Game Over");
                this.gameOver();
                return;
            }

            /* Check for food. */
            if (head[0] === this.food[0] && head[1] === this.food[1]) {
                this.snake.unshift(head); // Grow the snake
                this.generateFood();
                this.score++; // Increment the score
                serialDebugMsg("SnakeGame: Score: " + this.score);
            } else {
                this.snake.pop(); // Move the snake
                this.snake.unshift(head);
            }
        }

        /* Handle end of game state
         * Shows game over message and score. */
        private gameOver(): void {
            this.isGameOver = true;
            if (63 >= this.score) {
                //basic.showString("Game Over");
                scrollText("Game Over", neopixel.colors(NeoPixelColors.White), 90);
                scrollText("" + this.score, neopixel.colors(NeoPixelColors.Blue), 85);
                serialDebugMsg("SnakeGame: Game Over with score " + this.score);
            } else {
                scrollText("You Won the Game", neopixel.colors(NeoPixelColors.White), 90);
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
                )
                serialDebugMsg("SnakeGame: You won the game with score " + this.score);
            }
            control.reset();
        }

        /* Main game loop update function
         * Updates snake position and redraws the game state. */
        private updateGame(): void {
            if (this.isGameOver) return;
            if (!this._matrix) {
                serialDebugMsg("SnakeGame: Error - Matrix object is not initialized");
                return;
            }
            this._matrix.clear();
            this.updateSnake();
            this.drawSnake();
            this.drawFood();
            this._matrix.show();
        }

        /* Change the snake's direction based on joystick input
         * Prevents 180-degree turns (can't go directly backward). */
        private changeDirection(newDirection: eJoystickDirection): void {
            if ((this.direction === eJoystickDirection.Up && newDirection !== eJoystickDirection.Down) ||
                (this.direction === eJoystickDirection.Down && newDirection !== eJoystickDirection.Up) ||
                (this.direction === eJoystickDirection.Left && newDirection !== eJoystickDirection.Right) ||
                (this.direction === eJoystickDirection.Right && newDirection !== eJoystickDirection.Left)) {
                this.direction = newDirection;
                serialDebugMsg("SnakeGame: Direction changed to " + newDirection);
            }
        }

        /*  Start the main game update loop in background. */
        private startGameLoop(): void {
            control.inBackground(() => {
                while (true) {
                    this.updateGame();
                    basic.pause(this.gameInterval);
                }
            });
        }

        /* Handle joystick input for snake direction. */
        private handleUserInput(): void {
            control.inBackground(() => {
                while (true) {
                    const joystickDirection = readJoystick();
                    switch (joystickDirection) {
                        case eJoystickDirection.Up:
                        case eJoystickDirection.Down:
                        case eJoystickDirection.Left:
                        case eJoystickDirection.Right:
                            this.changeDirection(joystickDirection);
                            break;
                    }
                    basic.pause(pollingInterval); // Polling interval for joystick input
                }
            });
        }
    }
}