// components/js/collision-manager.js

// ADD THIS IMPORT at the top of the file
import { getFirstIntersection } from './utils.js';

export function update_balls_movment(engine, position_epsilon = 2) {

  engine.handle_boundreis_collision();
  const merging_balls = engine.handle_balls_collision();


    // check again if any is out of bounds after we moved the balls!
  for (const ball of engine.balls) {
    if (ball.x + ball.radius > engine.canvas.width) {
      ball.x = engine.canvas.width - ball.radius;
      ball.vel.x = 0;
    }
    else if (ball.x - ball.radius < 0){
      ball.x = 0 + ball.radius;
      ball.vel.x = 0;
    }
    if (ball.y + ball.radius + position_epsilon > engine.canvas.height) 
      ball.y = engine.canvas.height - ball.radius - position_epsilon;
  }
  return merging_balls;

}

export function handle_boundreis_collision(engine, position_epsilon = 2, velocity_epsilon = 2) {

  for (const ball of engine.balls) {

    let is_collision_with_boundries = false;

    //check for collision with boundries
    if (ball.x + ball.radius + position_epsilon > engine.canvas.width) {    //right
      ball.x = engine.canvas.width - ball.radius - position_epsilon;
      ball.vel.x *= -0.9;
      is_collision_with_boundries = true;
    }
    else if (ball.x - ball.radius - position_epsilon < 0) {          //left         
      ball.x = 0 + ball.radius + position_epsilon;
      ball.vel.x *= -0.9;
      is_collision_with_boundries = true;
    } 
    if (ball.y + ball.radius + position_epsilon > engine.canvas.height) {   //buttom 
      ball.vel.y *= -0.36;
      ball.y = engine.canvas.height - ball.radius - position_epsilon;
      is_collision_with_boundries = true;
    } 
    else if (ball.y + ball.radius + position_epsilon < 0) {          //top
      ball.vel.y *= -0.36;
      ball.y = engine.canvas.height + ball.radius + position_epsilon;
      is_collision_with_boundries = true;
      
    }

    if(is_collision_with_boundries){
      const is_ball_with_velocity = Math.abs(ball.vel.y) > velocity_epsilon;
      if(is_ball_with_velocity){
        ball.set_smily(false);
        engine.play_sound('ball-hit-boundries');    
      }
      
    }


  }

}

export function handle_balls_collision(engine, velocity_epsilon = 2) {

  let out_merging_balls = [];
    // Check for collisions
  for (let i = 0; i < engine.balls.length; i++) 
  {
    for (let j = i + 1; j < engine.balls.length; j++) 
    {
      const ball_A = engine.balls[i];
      const ball_B = engine.balls[j];

      const dx = ball_B.x - ball_A.x;
      const dy = ball_B.y - ball_A.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const is_collision = distance < ball_A.radius + ball_B.radius;
      const is_ball_with_velocity = Math.abs(ball_A.vel.y) > velocity_epsilon || Math.abs(ball_B.vel.y) > velocity_epsilon;


      const is_same_color = getFirstIntersection(ball_A.colors, ball_B.colors) != null;

      if(is_ball_with_velocity && is_collision){
        ball_A.set_smily(true, ball_B);    
      }
      



      if(is_collision && (ball_A.ball_type == "ball-bomb" || ball_B.ball_type == "ball-bomb"))
      {
        engine.play_sound('ball-bomb');
        engine.handle_collsion_with_bomb(ball_A, ball_B);

      }

      else if(is_collision && (ball_A.ball_type == "נbird" || ball_B.ball_type == "bird"))
      {
        engine.play_sound('bird');
        engine.handle_collision_with_bird(ball_A, ball_B);

      }
      else if(is_collision && (ball_A.ball_type == "cow" || ball_B.ball_type == "cow"))
      {
        engine.play_sound('cow');
        engine.handle_collision_with_dynamite(ball_A, ball_B);
      }
      else if (is_collision && (ball_A.ball_type == "parrots" || ball_B.ball_type == "parrots"))
      {
        engine.play_sound('parrots');
        engine.handle_collision_with_parrots(ball_A, ball_B);
      }
      else if(is_collision && (ball_A.ball_type == "dynamite" || ball_B.ball_type == "dynamite"))
      {
        engine.play_sound('dynamite');
        engine.handle_collision_with_dynamite(ball_A, ball_B);
      }

      else if(is_collision && (ball_A.ball_type == "atomic-bomb" || ball_B.ball_type == "atomic-bomb"))
      {
        engine.play_sound('atomic-bomb');
        engine.handle_collision_with_atomic_bomb(ball_A, ball_B);
      }
      else if(is_collision && is_same_color) 
      {
        engine.play_sound("same-color-merge-audio");
        out_merging_balls = engine.handle_collidion_with_same_color(ball_A, ball_B);
      }
      else if(is_collision)
      {
        if(is_ball_with_velocity)
        {
          engine.play_sound("ball-hits-ball-audio");
        }
        engine.handle_collision_between_balls(ball_A, ball_B);
      }
    }
  }

  return out_merging_balls

}

export function handle_collision_with_bird(engine, ball_A, ball_B) {

  engine.on_increase_score_callback();
  engine.last_animation_timestamp = Date.now();
  bird_animation(engine.ctx, engine.balls);
  engine.balls.forEach(ball=>ball.show_balls_explode_animation(engine.ctx))
  engine.balls = [];
  engine.trigger_golden_butterfly_effect().then(() => engine.initialize_board_balls());

  if(Math.random() < 0.20)
  {
    displayString()
  }

}

export function handle_collision_with_parrots(engine, ball_A, ball_B) {

  engine.on_increase_score_callback();
  engine.last_animation_timestamp = Date.now();
  parrots_animation(engine.ctx, ball_A)
  ball_A.show_balls_explode_animation(engine.ctx);
  ball_B.show_balls_explode_animation(engine.ctx);
  engine.balls.splice(engine.balls.findIndex(item => item === ball_A), 1);
  engine.balls.splice(engine.balls.findIndex(item => item === ball_B), 1);

  if(Math.random() < 0.20)
  {
    displayString()
  }

}

export function handle_collision_with_atomic_bomb(engine, ball_A, ball_B) {

  engine.on_increase_score_callback();
  engine.last_animation_timestamp = Date.now();
  atomic_bomb_animation(engine.ctx);
  engine.balls.forEach(ball=>ball.show_balls_explode_animation(engine.ctx))
  engine.balls = [];
  engine.trigger_golden_butterfly_effect().then(() => engine.initialize_board_balls());

  if(Math.random() < 0.20)
  {
    displayString()
  }

}

export function handle_collidion_with_same_color(engine, ball_A, ball_B) {

  const radius_to_explode = 60;
  const out_merging_balls = [];
  engine.on_increase_score_callback();
  const newRadius = Math.sqrt(ball_A.radius ** 2 + ball_B.radius ** 2);
  ball_A.radius = newRadius;
  ball_A.colors = [getFirstIntersection(ball_A.colors, ball_B.colors)]

  engine.balls.splice(engine.balls.findIndex(item => item === ball_B), 1);
  out_merging_balls.push(ball_A);
  out_merging_balls.push(ball_B);
  if (ball_A.radius > radius_to_explode)
  {
    engine.play_sound('ball-pop');
    engine.last_animation_timestamp = Date.now();
    ball_A.show_balls_explode_animation(engine.ctx);
    engine.balls.splice(engine.balls.findIndex(item => item === ball_A), 1);

    if (engine.balls.length === 0) {
      engine.trigger_golden_butterfly_effect().then(() => engine.initialize_board_balls());
    }

    if(Math.random() < 0.20)
    {
      displayString()
    }
  }
  return out_merging_balls;

}

export function handle_collision_with_dynamite(engine, ball_A, ball_B, position_epsilon = 5) {

  engine.on_increase_score_callback();
  const dynamite_ball = ball_A.ball_type == "dynamite" ? ball_A: ball_B;
  const effected_balls = [ball_A, ball_B];

  for (let k = 0; k < engine.balls.length; k++) {
    const dx = engine.balls[k].x - dynamite_ball.x;
    const dy = engine.balls[k].y - dynamite_ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const is_collision_near_ball = distance - position_epsilon <= dynamite_ball.radius + engine.balls[k].radius;

    if(is_collision_near_ball)
    {
      effected_balls.push(engine.balls[k]);

      for(let l=0; l< engine.balls.length; l++){
        const dx = engine.balls[l].x - engine.balls[k].x;
        const dy = engine.balls[l].y - engine.balls[k].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const is_ball_near_a_ball_near_dynamite = distance - position_epsilon <= engine.balls[k].radius + engine.balls[l].radius;
        if(is_ball_near_a_ball_near_dynamite){
          effected_balls.push(engine.balls[l]);
        } 
      }


    }
  }

  engine.last_animation_timestamp = Date.now();
  effected_balls.forEach((ball)=>{
    ball.show_balls_explode_animation(engine.ctx);
  });

  engine.balls = engine.balls.filter(item => !effected_balls.includes(item));

  if (engine.balls.length === 0) {
    engine.trigger_golden_butterfly_effect().then(() => engine.initialize_board_balls());
  }

  if(Math.random() < 0.20)
  {
    displayString()
  }

}

export function handle_collsion_with_bomb(engine, ball_A, ball_B) {

  engine.on_increase_score_callback();
  engine.last_animation_timestamp = Date.now();
  ball_A.show_balls_explode_animation(engine.ctx);
  ball_B.show_balls_explode_animation(engine.ctx);
  engine.balls.splice(engine.balls.findIndex(item => item === ball_A), 1);
  engine.balls.splice(engine.balls.findIndex(item => item === ball_B), 1);

  if (engine.balls.length === 0) {
    engine.trigger_golden_butterfly_effect().then(() => engine.initialize_board_balls());
  }

  if(Math.random() < 0.20)
  {
    displayString()
  }

}

export function handle_collision_between_balls(engine, ballA, ballB, position_epsilon = 0.5) {


  const dx = ballB.x - ballA.x;
  const dy = ballB.y - ballA.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
        // solve velocity
  const normX = dx / distance;
  const normY = dy / distance;
  const tx = -normY;
  const ty = normX;

  const dot1 = ballA.vel.x * tx + ballA.vel.y * ty;
  const dot2 = ballB.vel.x * tx + ballB.vel.y * ty;

  const weight = (ballA.get_mass() / ballB.get_mass());
  const overlap = 0.5 * (distance - ballA.radius - ballB.radius);
  const offsetI = overlap * (1 / weight);
  const offsetJ = overlap * weight;

  ballA.vel.x = tx * dot1;
  ballA.vel.y = ty * dot1;    
  ballB.vel.x = tx * dot2;
  ballB.vel.y = ty * dot2;
  ballA.vel.x += (offsetI * dx / distance) * 0.3;
  ballB.vel.y += (offsetI * dy / distance) * 0.3;
  ballB.vel.x -= (offsetJ * dx / distance) * 0.3;
  ballB.vel.y -= (offsetJ * dy / distance) * 0.3;


          // set position 
  ballA.x += offsetI * dx / distance + position_epsilon * ballA.vel.x;
  ballA.y += offsetI * dy / distance + position_epsilon * ballA.vel.y;

  ballB.x -= offsetJ * dx / distance + position_epsilon * ballB.vel.x;
  ballB.y -= offsetJ * dy / distance + position_epsilon * ballB.vel.y;

}
