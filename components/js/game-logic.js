// components/js/game-logic.js

import { GameEngine } from './game-engine.js';

export function initialize_board_balls(engine, ) {

    const radius = 20;
    const padding = 4;
    const step = (radius * 2) + padding;

    // Available area: below line_height to canvas bottom, full width
    const areaTop = engine.line_height;
    const areaBottom = engine.canvas.height;
    const areaLeft = radius + padding;
    const areaRight = engine.canvas.width - radius - padding;
    // Build a grid of candidate positions
    const candidates = [];
    for (let y = areaTop + radius + padding; y + radius + padding <= areaBottom; y += step) {
      for (let x = areaLeft; x + radius <= areaRight; x += step) {
        candidates.push({ x, y });
      }
    }

    // Shuffle candidates
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
    }

    // Fill 3/4 of available slots
    const fillCount = Math.floor(candidates.length * 0.75);
    const selected = candidates.slice(0, fillCount);

    for (const pos of selected) {
      const color = getRandomColors(1);
      const ball = new Ball(pos.x, pos.y, radius, color, engine.line_height, "ball", null);
      // Give them zero velocity so they sit still
      ball.vel = { x: 0, y: 0 };
      ball.is_crossed_line = true;
      engine.balls.push(ball);
    }
  
}

export function create_random_ball(engine, x = 0, y = 0, radius = 20) {

  let out_new_ball;

  const ball_type = engine.determine_ball_type();
  
  if (ball_type == "ball")
  {
    out_new_ball = new Ball(x, y, radius, getRandomColors(), engine.line_height, ball_type, null); 
  }
  else if(ball_type == "ball-bomb")
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), engine.line_height, ball_type, GameEngine.BallBombImage);
  }
  else if (ball_type == "bird")
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), engine.line_height, ball_type, GameEngine.BirdImage);
  }
  else if(ball_type == "cow")
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), engine.line_height, ball_type, GameEngine.CowImage); 

  }
  else if(ball_type == "parrots")
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), engine.line_height, ball_type, GameEngine.ParrotsImage); 

  } 
  else if(ball_type == "dynamite")
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), engine.line_height, ball_type, GameEngine.DynamiteImage); 

  } 
  else if(ball_type == 'atomic-bomb')
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), engine.line_height, ball_type, GameEngine.AtomicBombImage);
  }

  return out_new_ball;

}

export function determine_ball_type(engine, is_ball_bomb_probability = 0.10, is_parrtos_probability = 0.08, is_dynamite_probability = 0.004,  is_cow_probability = 0.005,  is_atomic_bomb_probability = 0.002, is_bird_probabbility=0.002) {

    // Generate a random number between 0 and 1
  const randomValue = Math.random();

    // Determine the ball type based on probabilities
  if (randomValue < is_ball_bomb_probability) 
  {
    return "ball-bomb";
  }

 else if (randomValue < is_ball_bomb_probability + is_parrtos_probability) 
  {
    return "parrots";
  }
  else if (randomValue < is_ball_bomb_probability  + is_parrtos_probability + is_dynamite_probability)
  {

    return "dynamite";
  }
  else if (randomValue < is_ball_bomb_probability  + is_parrtos_probability + is_dynamite_probability + is_cow_probability) 
  {
    return "cow";
  }

  else if (randomValue < is_ball_bomb_probability  + is_parrtos_probability + is_dynamite_probability + is_cow_probability + is_atomic_bomb_probability) 
  {
    return "atomic-bomb";
  } 
  else if (randomValue < is_ball_bomb_probability  + is_parrtos_probability + is_dynamite_probability + is_cow_probability + is_atomic_bomb_probability + is_bird_probabbility) 
  {
    return "bird";
  }

  else 
  {
    return "ball";
  }

}

export function is_game_over(engine, velocity_epsilon = 1.5) {

  for (const ball of engine.balls) 
  {
    const is_ball_above_line = !ball.is_ball_below_line;
    const is_ball_static = Math.abs(ball.vel.x) < velocity_epsilon && Math.abs(ball.vel.y) < velocity_epsilon;

    if(ball.is_line_intersect() && ball.is_crossed_line && is_ball_static){
      return true;
    }
    if(is_ball_above_line && !ball.is_crossed_line && is_ball_static){
      return true;
    }
  }
  return false;


}

export function handle_game_over(engine, ) {


  for (const ball of engine.balls) 
  {
    ball.vel = (0,0);

  }
  engine.is_playing = false
  engine.mouse_ball = null;

  engine.last_animation_timestamp = Date.now();
  engine.balls.forEach(ball => {
    ball.show_balls_explode_animation(engine.ctx, true);
  });
  
  

    // window.setTimeout(()=>{engine.is_playing = false;}, 3000)
  
  
  engine.on_game_over_callback();

  
  
  window.setTimeout(()=>{engine.draw(null);}, 3000)
  
  

  window.setTimeout(()=>{
    document.addEventListener('click', reload_page);
    document.addEventListener('keydown',  reload_page);}, 2000)


  function reload_page(){
   document.removeEventListener('click', reload_page);
   document.removeEventListener('keydown', reload_page);
   window.location.reload();

 }


}

export function increase_point(engine, ) {

    engine.points = engine.points + 1;
  
}
