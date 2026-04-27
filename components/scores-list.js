// scores-list.js

const ScoresList = {
  template: `
    <ul id="scores-list" style="width: 220px; list-style-type: none;">
      <li v-for="(curr_score, index) in scores_display.top" :key="'top-' + index">
        <span  style="width: 40px;">{{ curr_score.position + ')' }}</span>
        <span style="width: 120px; font-size: 1em;">{{ curr_score.username }}</span>
        <span style="width: 40px;"><b>{{ curr_score.points }}</b></span>
      </li>

      <hr v-if="scores_display.top.length > 0">

      <li v-for="(curr_score, index) in scores_display.relative" :key="'relative-' + index" :class="{ 'highlight-score': curr_score.id === score.id }">
        <span style="width: 40px;">{{ curr_score.position + ')' }}</span>
        <span style="width: 120px; font-size: 1em;">{{ curr_score.username }}</span>
        <span style="width: 40px;"><b>{{ curr_score.points }}</b></span>
      </li>
    </ul>
    `,
    props: ['score', 'all_scores'],
    computed: {
      scores_display() {
        let out_display = { top: [], relative: [] };

        let curr_score = { ...this.score  };
        curr_score.position = '*';
        const all_scores = this.all_scores.filter(item => item.id !== curr_score.id);
        let user_score_index = this.all_scores.findIndex(item => item.points < curr_score.points);


        if ((user_score_index <= 10 && user_score_index >= 0) || all_scores.length < 10) {
          out_display.relative = all_scores.slice(0, 10);
          user_score_index = user_score_index === -1 ? all_scores.length : user_score_index;
          out_display.relative.splice(user_score_index, 0, curr_score);
        } else {
          out_display.top = all_scores.slice(0, 10);
          if (user_score_index === -1 || user_score_index >= all_scores.length - 2) {
            out_display.relative = all_scores.slice(-4);
            out_display.relative.push(curr_score);
          } else {
            out_display.relative = all_scores.slice(user_score_index - 2, user_score_index + 2);
            out_display.relative.splice(2, 0, curr_score);
          }
        }
        return out_display;
      }
    },
    methods: {
      animate_user_score() {
        let elements = document.getElementsByClassName('highlight-score');
        if (elements.length === 0) {
          return;
        }
        elements[0].classList.add('blink');
      }
    },
    mounted() {
      this.$nextTick(() => {
        this.animate_user_score();
      });
    }
  };

// If needed elsewhere, you can export it like:
// export { ScoresList };
