// components/game-board.js

import { GameEngine } from './js/game-engine.js'; // Ensure this import is also present

export const GameBoard = { // <--- Added 'export' here
    template: `
      <div id="canvas-wrap">
        <canvas id="gameCanvas" width="350" height="500"></canvas>
      </div>
    `,
  props: ['score'],
  data() {
    return {
      input_username: '',
      is_username_received: false,
      canvas: null,
      ctx: null,
      mouse_ball: null,
      points: 0,
    };
  },
  emits: ['on-increase-score', 'on-game-over', 'on-set-username'],
  mounted() {
    this.initializeCanvas();
  },
  methods: {
      initializeCanvas() {
          this.canvas = document.getElementById('gameCanvas');
          this.ctx = this.canvas.getContext('2d');

          // Calculate 25% of the canvas height (500 * 0.25 = 125)
          const deadlineY = this.canvas.height * 0.25;

          // Initialize the engine with the new 125px line height
          this.gameEngine = new GameEngine(this.canvas, deadlineY, this.onIncreaseScore, this.onGameOver);

          this.gameEngine.initialize_game().then(() => {
              // Position the starting ball higher up to accommodate the new line
              this.gameEngine.mouse_ball = this.gameEngine.create_random_ball(this.canvas.width / 2, 10);
              this.mouse_ball = this.gameEngine.mouse_ball;
              this.addEventListeners();
              this.gameEngine.start_game();
          });
      },
    addEventListeners() {
      this.canvas.addEventListener("mousemove", (event) => {
        if (this.mouse_ball) {
          const mouse_position = {
            x: event.clientX - this.canvas.getBoundingClientRect().left,
            y: event.clientY - this.canvas.getBoundingClientRect().top
          };
          this.gameEngine.on_mouse_ball_move(mouse_position.x, mouse_position.y);
        }
      });

      this.canvas.addEventListener("click", (event) => {
        if (this.mouse_ball) {
          const mouse_position = {
            x: event.clientX - this.canvas.getBoundingClientRect().left,
            y: event.clientY - this.canvas.getBoundingClientRect().top
          };
          this.mouse_ball = this.gameEngine.on_mouse_ball_drop(mouse_position.x, mouse_position.y);
        }
      });
    },
      async restartGame() {
          await this.gameEngine.initialize_game();
          // Reset local references
          this.gameEngine.mouse_ball = this.gameEngine.create_random_ball(this.canvas.width / 2, 10);
          this.mouse_ball = this.gameEngine.mouse_ball;
          this.gameEngine.is_playing = true; // Ensure the engine is ready to play
          this.gameEngine.start_game();
      },
      onIncreaseScore() {
          this.gameEngine.increase_point();
          this.$emit('on-increase-score');
      },
      onGameOver() {
          this.$emit('on-game-over');
      },
    setUsername(input_username) {
      if (input_username !== '') {
        this.$emit('on-set-username', input_username);
        this.is_username_received = true;
      }
    },
  }
};

