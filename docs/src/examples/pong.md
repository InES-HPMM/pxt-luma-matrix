
# Pong Game

This is a simple multiplayer Pong game that can be played with two luma matrices connected over the same radio channel. The game is played by moving the paddles up and down to hit the ball. The first player to score 7 points wins the game.

## Setup
1. Open the MakeCode project [Luma Pong](https://makecode.microbit.org/S73906-10115-41608-82202)
2. Set the radio channel to a desired number (default is 8). This must be the same for both players and should be a different channel than other Luma Matrices around may be using.
3. Download the same code to both Luma Matrices. Make sure to select the correct board in the MakeCode editor.
4. Player 1 (host) can be selected by turning on the switch SW1 (right) on the Luma Matrix. Player 2 (guest) can be selected by turning off the switch SW1 (left) on the Luma Matrix.
5. The game runs as soon as host is started. 
6. Button A is used to restart the game


<div style="position:relative;height:0;padding-bottom:70%;overflow:hidden;"><iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" src="https://makecode.microbit.org/#pub:S73906-10115-41608-82202" frameborder="0" sandbox="allow-popups allow-forms allow-scripts allow-same-origin"></iframe></div>

<script src="../assets/js/gh-pages-embed.js"></script><script>makeCodeRender("https://makecode.microbit.org/", "ines-hpmm/pxt-luma-matrix");</script>