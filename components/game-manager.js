// game-manager.js

const GameManager = {
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

      Vue.onMounted(async () => {
        await load_all_scores();
      });

      async function increase_score() {
        if (!score.id) {
          await register_user(score.username);
        }
          score.points = score.points + 1;
        await axios.post('/api/scores/increase', {
            id: score.id,
            token: score.token
        }).then(res=> score.next_increase_token = res.data.next_increase_token)
            .catch(()=>{
                save_score_to_local_storage(score.id, score.username, score.points);
            });

        score.position = all_scores.value.map(item => item.points).lastIndexOf(score.points);
      }

      async function register_user(username) {
        score.points = 0;

        await axios.post(`api/scores`, {username}).then(res=>{
            score.id = res.data.id;
            score.token = res.data.token;
            score.next_increase_token = res.data.next_increase_token;
        }).catch(()=>{
            score.id = crypto.randomUUID();
            save_score_to_local_storage(score.id, username, score.points);
        })
      }

      function save_score_to_local_storage(score_id, username, points){
          localStorage.setItem(score_id, JSON.stringify({
              id:score_id,
              username:username,
              points:points,
              timestamp: new Date().toISOString(),
          }));
      }

      async function set_username(new_username) {
        score.username = new_username;
      }

      async function game_over() {
          await load_all_scores();
          score.position = all_scores.value.map(item => item.points).lastIndexOf(score.points);

          is_game_over.value = true;

        document.addEventListener('click', handle_game_over_mouse_click);
        document.addEventListener('keydown', handle_game_over_mouse_click);

        function handle_game_over_mouse_click() {
          document.removeEventListener('click', handle_game_over_mouse_click);
          document.removeEventListener('keydown', handle_game_over_mouse_click);
        }
      }

      async function load_all_scores() {
        await axios.get(`api/scores`).then(response=> all_scores.value = response.data)
            .catch(()=>all_scores.value = load_scores_from_local_storage())
      }

      function load_scores_from_local_storage(){
          console.log("Loading scores from local storage");
          const scores_from_local_storage = Object.keys(localStorage).map(k => JSON.parse(localStorage.getItem(k)));
          const scores_from_local_storage_with_position = scores_from_local_storage
              .slice()
              .sort((a, b) => b.points - a.points)
              .map((item, i) => ({ ...item, position: i + 1 }));

          return scores_from_local_storage_with_position;
        }

      return {
        score,
        all_scores,
        is_game_over,
        increase_score,
        register_user,
        set_username,
        game_over,
        load_all_scores
      };
    }
  };

