// gameover-blocker.js

export const GameoverBlocker = {
  name: 'GameoverBlocker',
  template: `
    <div id="gameover-blocker" ref="blocker_container" tabindex="-1">
      <h1 class="blocker-headline">Game Over</h1>
      <p class="score_text">
        You Scored: <b>{{ game_score }}</b>
      </p>
      <p class="score_position">
        Your Position: <b>{{ score_board_position }} out of {{ max_position_count }}</b>
      </p>
    </div>
  `,
  props: ['game_score', 'score_board_position', 'max_position_count'],
  mounted() {
    this.gameOverDiv = document.getElementById("gameover-blocker");
    this.gameOverDiv.style.display = 'block';
    console.log("Game Over");
    this.$nextTick(() => {
      this.gameOverDiv.focus();
    });
  }
};

// You can export it later if needed:
// export { GameoverBlocker };
