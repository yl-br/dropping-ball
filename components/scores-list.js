// components/scores-list.js
export const ScoresList = {
    template: `
      <ul id="scores-list" style="width: 220px; list-style-type: none; padding: 0;">
        <li v-for="(curr_score, index) in scores_display.top" :key="'top-' + index" :class="{ 'highlight-score': curr_score.id === score.id }">
          <span style="display: inline-block; width: 40px;">{{ curr_score.position + ')' }}</span>
          <span style="display: inline-block; width: 120px; font-size: 1em;">{{ curr_score.username }}</span>
          <span style="display: inline-block; width: 40px;"><b>{{ curr_score.points }}</b></span>
        </li>

        <hr v-if="scores_display.top.length > 0">

        <li v-for="(curr_score, index) in scores_display.relative" :key="'relative-' + index" :class="{ 'highlight-score': curr_score.id === score.id }">
          <span style="display: inline-block; width: 40px;">{{ curr_score.position + ')' }}</span>
          <span style="display: inline-block; width: 120px; font-size: 1em;">{{ curr_score.username }}</span>
          <span style="display: inline-block; width: 40px;"><b>{{ curr_score.points }}</b></span>
        </li>
      </ul>
    `,
    props: ['score', 'all_scores'],
    computed: {
        scores_display() {
            // Safety check for all_scores to prevent errors if the array is null or undefined
            const rankedScores = [...(this.all_scores || []).filter(item => item.id !== this.score.id), this.score]
                .sort((a, b) => b.points - a.points)
                .map((item, index) => ({
                    ...item,
                    position: index + 1 // Assign actual numeric rank
                }));

            const userIndex = rankedScores.findIndex(item => item.id === this.score.id);
            let out_display = { top: [], relative: [] };

            // Logic to determine display segments
            if (userIndex < 10) {
                // If user is in the top 10, show the top 10 in the relative list
                out_display.relative = rankedScores.slice(0, 10);
            } else {
                // If user is lower, show the top 10 and then a "window" around the user
                out_display.top = rankedScores.slice(0, 10);

                const start = Math.max(0, userIndex - 2);
                const end = Math.min(rankedScores.length, userIndex + 3);
                out_display.relative = rankedScores.slice(start, end);
            }

            return out_display;
        }
    },
    methods: {
        animate_user_score() {
            // Use nextTick to ensure DOM is updated before looking for classes
            this.$nextTick(() => {
                let elements = document.getElementsByClassName('highlight-score');
                if (elements.length > 0) {
                    elements[0].classList.add('blink');
                }
            });
        }
    },
    watch: {
        // Re-trigger animation when the score points change
        'score.points'() {
            this.animate_user_score();
        }
    },
    mounted() {
        this.animate_user_score();
    }
};