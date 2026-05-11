// components/game-manager.js
import { GameBoard } from './game-board.js';
import { UsernameBlocker } from './username-blocker.js';
import { ScoresList } from './scores-list.js';
import { GameoverBlocker } from './gameover-blocker.js';
import { ImagesCollage } from './images-collage.js';

export const GameManager = {
    name: 'GameManager',
    components: {
        UsernameBlocker,
        ScoresList,
        GameBoard,
        GameoverBlocker,
        ImagesCollage
    },
    template: `
      <div>
        <UsernameBlocker @on-set-username="set_username"></UsernameBlocker>
        <GameoverBlocker
            v-if="is_game_over"
            :game_score="score.points"
            :score_board_position="score.position"
            :max_position_count="all_scores.length"
        />

        <!-- ============================================================== -->
        <!-- Restart button: 40px-tall blue fusion pill. Fixed top-right so   -->
        <!-- it's always reachable, including while the game-over screen is  -->
        <!-- showing. Hover spins the refresh icon a full 360°.              -->
        <!-- ============================================================== -->
        <button
            class="restart-game-btn"
            type="button"
            @click="restart_game"
            title="Restart Game"
            aria-label="Restart Game"
        >
          <svg class="restart-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-3-6.7"/>
            <polyline points="21 4 21 10 15 10"/>
          </svg>
        </button>

        <div class="row d-flex justify-content-center align-items-center">
          <h1 id="headline">Ball Dropping Game</h1>
        </div>
        <div class="row gx-4 d-flex justify-content-center align-items-center">
          <div class="col-3">
            <ImagesCollage></ImagesCollage>
          </div>

          <div class="col-5">
            <ScoresList
                class="col"
                ref="scoresList"
                :score="score"
                :all_scores="all_scores"
            />
          </div>
        </div>

        <div class="table table-bordered w-100">
          <div class="row justify-content-center">
            <div class="grid">
              <GameBoard
                  id="game-board"
                  ref="gameBoardRef"
                  :score="score"
                  @on-increase-score="increase_score"
                  @on-game-over="game_over"
                  @on-set-username="set_username"
              />
              <hr>
            </div>
          </div>
        </div>
      </div>
    `,
    setup() {
        const score = Vue.reactive({
            points: 0,
            position: null,
            username: 'You',
            id: null,
            token: null,
            next_increase_token: null
        });
        const all_scores = Vue.ref([]);
        const is_game_over = Vue.ref(false);
        const gameBoardRef = Vue.ref(null);

        // Track the pending auto-restart timer from game_over so that a manual
        // restart can cancel it (otherwise the auto-restart fires 5s later
        // and wipes the new game we just started).
        let game_over_timeout_id = null;

        Vue.onMounted(async () => {
            await load_all_scores();
        });

        async function load_all_scores() {
            await axios.get(`api/scores`).then(response => all_scores.value = response.data)
                .catch(() => all_scores.value = load_scores_from_local_storage());
        }

        function load_scores_from_local_storage() {
            const scores_from_local_storage = Object.keys(localStorage).map(k => JSON.parse(localStorage.getItem(k)));
            const scores_from_local_storage_with_position = scores_from_local_storage
                .slice()
                .sort((a, b) => b.points - a.points)
                .map((item, i) => ({ ...item, position: i + 1 }));

            return scores_from_local_storage_with_position;
        }

        async function register_user(username) {
            score.points = 0;
            await axios.post(`api/scores`, {username}).then(res => {
                score.id = res.data.id;
                score.token = res.data.token;
                score.next_increase_token = res.data.next_increase_token;
            }).catch(() => {
                score.id = crypto.randomUUID();
                save_score_to_local_storage(score.id, username, score.points);
            });
        }

        function save_score_to_local_storage(score_id, username, points) {
            localStorage.setItem(score_id, JSON.stringify({
                id: score_id,
                username: username,
                points: points,
                timestamp: new Date().toISOString(),
            }));
        }

        async function increase_score() {
            if (!score.id) {
                await register_user(score.username);
            }
            score.points = score.points + 1;
            await axios.post('/api/scores/increase', {
                id: score.id,
                token: score.token
            }).then(res => score.next_increase_token = res.data.next_increase_token)
                .catch(() => {
                    save_score_to_local_storage(score.id, score.username, score.points);
                });

            score.position = all_scores.value.map(item => item.points).lastIndexOf(score.points);
        }

        async function set_username(new_username) {
            score.username = new_username;
        }

        async function game_over() {
            await load_all_scores();
            score.position = all_scores.value.map(item => item.points).lastIndexOf(score.points);

            // Show Game Over UI
            is_game_over.value = true;

            // Wait 5 seconds, then reset locally and restart the engine.
            // Store the timer id so restart_game() can cancel it if the user
            // chooses to restart manually before the 5s window expires.
            game_over_timeout_id = setTimeout(async () => {
                game_over_timeout_id = null;
                is_game_over.value = false;
                score.points = 0; // Reset score for the new game

                if (gameBoardRef.value) {
                    await gameBoardRef.value.restartGame();
                }
            }, 5000);
        }

        // -----------------------------------------------------------------
        // Manual restart triggered by the blue button.
        // Works whether the game is mid-play OR sitting on the game-over UI.
        // Resets local score state, cancels any pending auto-restart, and
        // tells the board component to relaunch the engine in-place — no
        // page reload.
        // -----------------------------------------------------------------
        async function restart_game() {
            // Cancel any pending auto-restart from a previous game-over,
            // otherwise it would fire later and clobber the new round.
            if (game_over_timeout_id) {
                clearTimeout(game_over_timeout_id);
                game_over_timeout_id = null;
            }

            // Hide the game-over overlay if it's showing
            is_game_over.value = false;

            // Reset the player's local score state
            score.points = 0;
            score.position = null;

            // Tell the board to stop the current loop and launch a fresh game
            if (gameBoardRef.value) {
                await gameBoardRef.value.restartGame();
            }
        }

        return {
            score,
            all_scores,
            is_game_over,
            gameBoardRef,
            increase_score,
            register_user,
            set_username,
            game_over,
            restart_game,
            load_all_scores
        };
    }
};
