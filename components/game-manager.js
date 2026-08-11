// components/game-manager.js
import { GameBoard } from './game-board.js';
import { UsernameBlocker } from './username-blocker.js';
import { ScoresList } from './scores-list.js';
import { GameoverBlocker } from './gameover-blocker.js';
import { ImagesCollage } from './images-collage.js';

const SCORE_KEY_PREFIX = 'score:';

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


        let game_over_timeout_id = null;

        let api_available = null;


        async function load_all_scores() {
            try {
                const response = await axios.get(`api/scores`);
                all_scores.value = response.data;
                api_available = true;
            } catch {
                all_scores.value = load_scores_from_local_storage();
                api_available = false;
            }
        }

        function load_scores_from_local_storage() {
            const scores_from_local_storage = Object.keys(localStorage)
                .filter(k => k.startsWith(SCORE_KEY_PREFIX))
                .map(k => {
                    try {
                        return JSON.parse(localStorage.getItem(k));
                    } catch {
                        return null;
                    }
                })
                .filter(Boolean);

            return scores_from_local_storage
                .slice()
                .sort((a, b) => b.points - a.points)
                .map((item, i) => ({ ...item, position: i + 1 }));
        }

        async function register_user(username) {
            score.points = 0;

            // No backend? Skip the network round-trip entirely.
            if (api_available === false) {
                score.id = crypto.randomUUID();
                save_score_to_local_storage(score.id, username, score.points);
                return;
            }

            try {
                const res = await axios.post(`api/scores`, {username});
                score.id = res.data.id;
                score.token = res.data.token;
                score.next_increase_token = res.data.next_increase_token;
            } catch {
                api_available = false;
                score.id = crypto.randomUUID();
                save_score_to_local_storage(score.id, username, score.points);
            }
        }

        function save_score_to_local_storage(score_id, username, points) {
            localStorage.setItem(SCORE_KEY_PREFIX + score_id, JSON.stringify({
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

            // No backend? Persist locally and skip the doomed POST.
            if (api_available === false) {
                save_score_to_local_storage(score.id, score.username, score.points);
            } else {
                try {
                    const res = await axios.post('api/scores/increase', {
                        id: score.id,
                        token: score.token
                    });
                    score.next_increase_token = res.data.next_increase_token;
                } catch {
                    api_available = false;
                    save_score_to_local_storage(score.id, score.username, score.points);
                }
            }

            score.position = all_scores.value.map(item => item.points).lastIndexOf(score.points);
        }

        async function set_username(new_username) {
            score.username = new_username;
        }

        async function game_over() {
            await load_all_scores();
            score.position = all_scores.value.map(item => item.points).lastIndexOf(score.points);

            is_game_over.value = true;

            game_over_timeout_id = setTimeout(async () => {
                game_over_timeout_id = null;
                is_game_over.value = false;
                start_new_round();

                if (gameBoardRef.value) {
                    await gameBoardRef.value.restartGame();
                }
            }, 5000);
        }

        // Reset everything that ties the score to the just-finished game,
        // so the next round registers as a brand new entry (new local-storage
        // key / new server record) instead of overwriting the previous one.
        // Without this, score.id survives restarts and every subsequent game
        // just overwrites the same saved score, so past rounds vanish.
        function start_new_round() {
            score.points = 0;
            score.position = null;
            score.id = null;
            score.token = null;
            score.next_increase_token = null;
        }

        // Manual restart triggered by the blue button.
        // Works mid-play OR while the game-over overlay is showing.
        async function restart_game() {
            if (game_over_timeout_id) {
                clearTimeout(game_over_timeout_id);
                game_over_timeout_id = null;
            }
            is_game_over.value = false;
            start_new_round();

            if (gameBoardRef.value) {
                await gameBoardRef.value.restartGame();
            }
        }

        // Load scores immediately on mount, so the list (local or remote)
        // is populated before the first game-over, not just after it.
        load_all_scores();

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
