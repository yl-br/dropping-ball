// app.js
import { GameManager } from './components/game-manager.js';

export const App = {
    components: {
        'game-manager': GameManager
    },
    template: `<game-manager></game-manager>`
};

// const App = {
//   name: 'App',
//   components: {
//     GameManager
//   },
//   template: `
//     <div class="container text-center grid">
//       <GameManager />
//     </div>
//   `
// };

