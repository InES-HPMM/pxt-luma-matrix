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
 * -- Author:   vore, hesu, ebep
 * --
 * ------------------------------------------------------------------
 */
namespace lumaMatrix {

    /**
     * Fully implemented hungry snake game with joystick controls.
     * Warning: Place only this block at the start and do not implement other code.
     */
    //% blockId="ZHAW_Game_Snake"
    //% block="snake game"
    //% subcategory="Games"
    export function snake(): void {
        control.inBackground(() => {
            const snakeGame = new SnakeGame();
            basic.pause(100);
            if (!snakeGame) {
                serialDebugMsg("snake: Error - snakeGame object is not initialized");
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

        private initializeMatrix(): void {
            this._matrix.setBrightness(currentBrightness);
            this._matrix.clear();
            this._matrix.show();
        }

        private setPixel(x: number, y: number, color: number): void {
            if (x >= 0 && x < 8 && y >= 0 && y < 8) {
                this._matrix.setPixelColor(y * 8 + x, color);
            }
        }

        private drawSnake(): void {
            for (let segment of this.snake) {
                this.setPixel(segment[0], segment[1], neopixel.colors(NeoPixelColors.Green));
            }
        }

        private drawFood(): void {
            this.setPixel(this.food[0], this.food[1], neopixel.colors(NeoPixelColors.Red));
        }

        private generateFood(): void {
            let x: number;
            let y: number;
            do {
                x = Math.randomRange(0, 7);
                y = Math.randomRange(0, 7);
            } while (this.snake.some(segment => segment[0] === x && segment[1] === y));
            this.food = [x, y];
        }

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

            /* Check for collisions with walls */
            if (head[0] < 0 || head[0] >= 8 || head[1] < 0 || head[1] >= 8) {
                this.gameOver();
                return;
            }

            /* Check for collisions with itself */
            if (this.snake.some(segment => segment[0] === head[0] && segment[1] === head[1])) {
                this.gameOver();
                return;
            }

            /* Check for food */
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

        private gameOver(): void {
            this.isGameOver = true;
            if (63 >= this.score) {
                //basic.showString("Game Over");
                scrollText("Game Over", neopixel.colors(NeoPixelColors.White), 90);
                scrollText("" + this.score, neopixel.colors(NeoPixelColors.Blue), 85);
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
            }
            control.reset();
        }

        private updateGame(): void {
            if (this.isGameOver) return;
            this._matrix.clear();
            this.updateSnake();
            this.drawSnake();
            this.drawFood();
            this._matrix.show();
        }

        private changeDirection(newDirection: eJoystickDirection): void {
            if ((this.direction === eJoystickDirection.Up && newDirection !== eJoystickDirection.Down) ||
                (this.direction === eJoystickDirection.Down && newDirection !== eJoystickDirection.Up) ||
                (this.direction === eJoystickDirection.Left && newDirection !== eJoystickDirection.Right) ||
                (this.direction === eJoystickDirection.Right && newDirection !== eJoystickDirection.Left)) {
                this.direction = newDirection;
            }
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