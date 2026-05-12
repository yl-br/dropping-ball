// components/game-board.js

import { GameEngine } from './js/game-engine.js';

export const GameBoard = {
    template: `
      <div class="game-board-container">

        <canvas id="gameCanvas" width="350" height="500"></canvas>

        <aside class="game-sidebar">
          <button class="restart-game-btn" @click="restartGame" title="Restart game">
            <span class="restart-icon">⟳</span>
          </button>
        </aside>

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

          const deadlineY = this.canvas.height * 0.25;

          this.gameEngine = new GameEngine(this.canvas, deadlineY, this.onIncreaseScore, this.onGameOver);

          this.gameEngine.initialize_game().then(() => {
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
          if (this.gameEngine) {
              this.gameEngine.is_playing = false;
              await new Promise(resolve => requestAnimationFrame(resolve));
          }

          await this.gameEngine.initialize_game();
          this.gameEngine.mouse_ball = this.gameEngine.create_random_ball(this.canvas.width / 2, 10);
          this.mouse_ball = this.gameEngine.mouse_ball;
          this.gameEngine.is_playing = true;
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
