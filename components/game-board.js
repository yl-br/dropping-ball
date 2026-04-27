// game-board.js

const GameBoard = {
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
      this.gameEngine = new GameEngine(this.canvas,250, this.onIncreaseScore, this.onGameOver);
      this.gameEngine.initialize_game().then(() => {
        this.mouse_ball = this.gameEngine.create_random_ball(this.canvas.width / 2, 10);
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

