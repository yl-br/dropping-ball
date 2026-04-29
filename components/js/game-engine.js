//game-engine.js



class GameEngine {

  static BallBombImage = new Image();
  static BirdImage = new Image();
  static DynamiteImage = new Image();
  static ParrotsImage = new Image();
  static CowImage = new Image();
  static AtomicBombImage = new Image();
  static WindImage = new Image();



  constructor(canvas, line_height = 200, on_increase_score_callback, on_game_over_callback) {
    this.line_height = line_height
    this.on_increase_score_callback = on_increase_score_callback;
    this.on_game_over_callback = on_game_over_callback;

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.is_playing = true;

    this.balls = [];
    this.leafs = [];
    this.mouse_ball = null;
    
    
    this.points = 0;
  }
    increase_point(){
    this.points = this.points + 1;
  }
  async initialize_game(){
    GameEngine.BallBombImage.src = "./assets/images/bomb_ball.png";
    GameEngine.BallBombImage.onload = ()=>{console.log("ball bomb image loaded.");};
    GameEngine.BirdImage.src = "./assets/images/bird.png";
    GameEngine.BirdImage.onload = ()=>{console.log("bird image loaded.");};
    GameEngine.DynamiteImage.src = "./assets/images/dynamite.png";
    GameEngine.DynamiteImage.onload = ()=>{console.log("dynamite bomb image loaded.");};
    GameEngine.ParrotsImage.src = "./assets/images/parrots.png";
    GameEngine.ParrotsImage.onload = ()=>{console.log("parrots image loaded.");};
    GameEngine.CowImage.src = "./assets/images/cow.png";
    GameEngine.CowImage.onload = ()=>{console.log("cow image loaded.");};
    GameEngine.AtomicBombImage.src = "./assets/images/atomic-bomb.png";
    GameEngine.AtomicBombImage.onload = ()=>{console.log("atomic bomb image loaded.");};
    GameEngine.WindImage.src = "./assets/images/wind.png";
    GameEngine.WindImage.onload = ()=>{console.log("wind image loaded.");};
    this.balls = [];
    this.leafs = [];
    this.mouse_ball = null;
    
    this.tiltAngle = 0;

    this.last_mouse_position = {x:0,y:0}
    this.mouse_ball = new Ball(this.canvas.width/2, this.line_height - 60, 20, ["yellow"], this.line_height, "ball");
    
    this.points = 0;
    this.mouse_move_timeout = 0;

    this.last_animation_timestamp = -1;

    this.last_drawing_timestamp = -1;

    this.isWeb = true;
    // this.audioPlayer = null;
    this.sounds = {
      "same-color-merge-audio": {sound_path:"./assets/audio/same-color-merge.wav", start_time:0},
      "ball-hits-ball-audio": {sound_path:"./assets/audio/ball-hits-ball.wav", start_time:0.4},
      "ball-hit-boundries"       : {sound_path: "./assets/audio/ball-hit-boundries.wav", start_time:0},
      "ball-bomb"       : {sound_path: "./assets/audio/ball-bomb.wav", start_time:0},
      "bird"            : {sound_path: "./assets/audio/bird.wav", start_time:0},
      "dynamite"       : {sound_path: "./assets/audio/dynamite.wav", start_time:0},
      "parrots"       : {sound_path: "./assets/audio/parrots.wav", start_time:0},
      "cow"       : {sound_path: "./assets/audio/cow.wav", start_time:0.7},
      "atomic-bomb"       : {sound_path: "./assets/audio/atomic-bomb.wav", start_time:1.3},
      "ball-pop": {sound_path: "./assets/audio/ball-pop.wav", start_time:0},
    };

    this.audioPlayers = {};


    for(let i = 0; i < 150; i ++) {
      const px = Math.floor(Math.random() * this.canvas.width);
      const py = Math.floor(Math.random() * this.canvas.height);
      const radius = Math.floor(Math.random() * 100);
      const newLeaf = new Leaf(px, py, radius / 10);
      this.leafs.push(newLeaf);
    }
    await this.initializeAudio();
    // this.initializeTilt();

    await this.trigger_golden_butterfly_effect();
    this.initialize_board_balls();

  }

  initialize_board_balls() {
    const radius = 20;
    const padding = 4;
    const step = (radius * 2) + padding;

    // Available area: below line_height to canvas bottom, full width
    const areaTop = this.line_height;
    const areaBottom = this.canvas.height;
    const areaLeft = radius + padding;
    const areaRight = this.canvas.width - radius - padding;
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
      const ball = new Ball(pos.x, pos.y, radius, color, this.line_height, "ball", null);
      // Give them zero velocity so they sit still
      ball.vel = { x: 0, y: 0 };
      ball.is_crossed_line = true;
      this.balls.push(ball);
    }
  }

  initializeTilt() {

  // Fallback for web browsers using DeviceOrientationEvent
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', this.handleTilt.bind(this));
    } else {
      console.log('Device orientation not supported');
    }
  }


  handleTilt(event) {
    let angle;
    
  // Check if the event is from DeviceOrientation (Browser)
    if (event.gamma !== undefined && event.beta !== undefined) {
      angle = Math.atan2(event.beta, event.gamma);
    }

    if (angle !== undefined) {
      console.log('Current Tilt Angle:', angle * (180 / Math.PI));
      this.tiltAngle = angle;
      this.balls.forEach(ball=>ball.update_tilt(this.tiltAngle));
    }
  }

  async initializeAudio() {
    this.audioUnlocked = false;

    if (this.isWeb) {
      // Initialize HTML5 Audio for each sound on web
      Object.keys(this.sounds).forEach(soundId => {
        this.audioPlayers[soundId] = new Audio(this.sounds[soundId].sound_path);
      });

      // Unlock audio on first user interaction (browser autoplay policy)
      const unlock = () => {
        if (this.audioUnlocked) return;
        this.audioUnlocked = true;
        Object.values(this.audioPlayers).forEach(player => {
          player.play().then(() => player.pause()).catch(() => {});
        });
        document.removeEventListener('click', unlock);
        document.removeEventListener('keydown', unlock);
        document.removeEventListener('touchstart', unlock);
      };

      document.addEventListener('click', unlock);
      document.addEventListener('keydown', unlock);
      document.addEventListener('touchstart', unlock);
    }
  }

  



  async play_sound(soundId) {
    try {
      if (this.isWeb) {
        if (!this.audioUnlocked) return;  // browser not yet unlocked by user interaction
        const audioPlayer = this.audioPlayers[soundId];
        audioPlayer.currentTime = this.sounds[soundId].start_time || 0;
        const playPromise = audioPlayer.play();

        playPromise.then(() => {
          console.log(`Audio ${soundId} is playing on web`);
        }).catch((e) => {
          if (e.name === 'AbortError') {
            console.warn(`Play request was aborted for audio ${soundId}:`, e);
          } else if (e.name === 'NotSupportedError') {
            console.error(`Audio format not supported for ${soundId}:`, e);
          } else {
            console.error(`Error playing audio ${soundId} on web:`, e);
          }
        });

      } else {

        await NativeAudio.play({
          assetId: soundId
        });
        console.log(`Audio ${soundId} is playing on mobile using NativeAudio`);
        
      }
    } catch (e) {
      console.error(`Error playing or stopping audio ${soundId}:`, e);
    }
  }






  isPlaying(soundId) {
    if (this.audioPlayers[soundId]) {
    // Check if the audio is not paused and the currentTime is greater than 0
      if (!this.audioPlayers[soundId].paused && this.audioPlayers[soundId].currentTime > 0) {
        console.log(`Audio ${soundId} is currently playing.`);
        return true;
      } else {
        console.log(`Audio ${soundId} is not playing.`);
        return false;
      }
    } else {
      console.error(`No audio player found for ${soundId}`);
      return false;
    }
  }






  on_mouse_ball_move(mouse_ball_x, mouse_ball_y){
    if(!this.mouse_ball){
      return;
    }

    this.mouse_ball.x = mouse_ball_x;
    this.mouse_ball.y = mouse_ball_y;
                // self.mouse_ball.draw(self.ctx);

    this.mouse_ball.stop_bounce_animation();

    const self = this;
    this.mouse_move_timeout = setTimeout(()=>{self.mouse_ball.start_bounce_animation()}, 50);



    clearTimeout(this.mouse_move_timeout);

    this.draw();

    this.handle_mouse_icon();
  }


  on_mouse_ball_drop(drop_position_x, drop_position_y){

    if(!this.mouse_ball){
      return;
    }

    this.mouse_ball.stop_bounce_animation();


    let is_ball_above_line = this.mouse_ball.y < this.line_height;
    if(is_ball_above_line) {
      this.balls.push(this.mouse_ball);
      this.mouse_ball.drop();
      this.mouse_ball.update_tilt(this.tiltAngle);



      this.mouse_ball.draw(this.ctx);

      this.mouse_ball = this.create_random_ball(drop_position_x, drop_position_y);
      this.mouse_ball.start_bounce_animation();
    }

    this.handle_mouse_icon();



    return this.mouse_ball;
  }



  start_game(){
   this.mouse_ball.start_bounce_animation();
   this.gameLoop();

 }
 stop_game(){
  this.is_playing = false;
}

create_random_ball(x = 0, y = 0, radius = 20){
  let out_new_ball;

  const ball_type = this.determine_ball_type();
  
  if (ball_type == "ball")
  {
    out_new_ball = new Ball(x, y, radius, getRandomColors(), this.line_height, ball_type, null); 
  }
  else if(ball_type == "ball-bomb")
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), this.line_height, ball_type, GameEngine.BallBombImage);
  }
  else if (ball_type == "bird")
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), this.line_height, ball_type, GameEngine.BirdImage);
  }
  else if(ball_type == "cow")
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), this.line_height, ball_type, GameEngine.CowImage); 

  }
  else if(ball_type == "parrots")
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), this.line_height, ball_type, GameEngine.ParrotsImage); 

  } 
  else if(ball_type == "dynamite")
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), this.line_height, ball_type, GameEngine.DynamiteImage); 

  } 
  else if(ball_type == 'atomic-bomb')
  {
    out_new_ball = new Ball(x, y, radius + 10, getRandomColors(), this.line_height, ball_type, GameEngine.AtomicBombImage);
  }

  return out_new_ball;
}



determine_ball_type(is_ball_bomb_probability = 0.10, is_parrtos_probability = 0.08, is_dynamite_probability = 0.004,  is_cow_probability = 0.005,  is_atomic_bomb_probability = 0.002, is_bird_probabbility=0.002) {
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



handle_mouse_icon(){

  const is_mouse_pointer_inside_canvas = this.mouse_ball.y > 0 && this.mouse_ball.y < this.canvas.height && this.mouse_ball.x > 0 && this.mouse_ball.x < this.canvas.width;
  const is_mouse_pointer_below_line =  this.mouse_ball.y >= this.line_height

  if(is_mouse_pointer_inside_canvas && is_mouse_pointer_below_line){ 
                      // Draw an indicator for not allow to drop.
    this.canvas.style.cursor = 'none'; 
    drawX(this.ctx, this.mouse_ball.x, this.mouse_ball.y)


  }
  else if(is_mouse_pointer_inside_canvas && !is_mouse_pointer_below_line){
    this.canvas.style.cursor = 'pointer';
  }
  else {
    this.canvas.style.cursor = "default"
  }


}







gameLoop(){
  if(!this.is_playing){
    return;
  }
  if(this.is_butterfly_playing){
    requestAnimationFrame(this.gameLoop.bind(this));
    return;
  }
    // Is game over ?
  if(this.is_game_over()){
    this.handle_game_over();
    return;    
  }      
  

  const frame_time_duration = new Date() - this.last_drawing_timestamp;
  this.last_drawing_timestamp = new Date();

  const merging_balls = this.update_balls_movment();

  this.balls.forEach(ball=> ball.update_position(frame_time_duration));
  this.leafs.forEach(leaf=> leaf.update_position(frame_time_duration, Ball.gravity, Ball.tiltMangnitude, this.tiltAngle, Ball.airFriction, 
    this.canvas.width, this.canvas.height));



  this.draw(merging_balls);


  this.handle_mouse_icon();



  requestAnimationFrame(this.gameLoop.bind(this));

}

drawScore() {
  this.ctx.font = "32px Arial";
  this.ctx.fillStyle = "#5E397A";
  this.ctx.fontWeight = '5px';
  this.ctx.fillText(`Score: ${this.points}`, 8, 30);
}

draw(merging_balls, animation_duration = 500) {

  const is_animation_in_progress = Date.now() - this.last_animation_timestamp < animation_duration;

  if(!is_animation_in_progress){
    this.erase_board();        
  }

  this.leafs.forEach(leaf=> leaf.draw.bind(leaf)(this.ctx));

  drawLine(this.ctx, this.line_height);
  if(this.mouse_ball){
    this.mouse_ball.draw(this.ctx);    
  }
  
  this.balls.forEach(ball => {
    ball.draw.bind(ball)(this.ctx);
  });

  this.drawScore();

}

erase_board()
{
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // this.ctx.drawImage(GameEngine.WindImage, 0, 0, this.canvas.width, this.canvas.height);      
}

update_balls_movment(position_epsilon = 2) {
  this.handle_boundreis_collision();
  const merging_balls = this.handle_balls_collision();


    // check again if any is out of bounds after we moved the balls!
  for (const ball of this.balls) {
    if (ball.x + ball.radius > this.canvas.width) {
      ball.x = this.canvas.width - ball.radius;
      ball.vel.x = 0;
    }
    else if (ball.x - ball.radius < 0){
      ball.x = 0 + ball.radius;
      ball.vel.x = 0;
    }
    if (ball.y + ball.radius + position_epsilon > this.canvas.height) 
      ball.y = this.canvas.height - ball.radius - position_epsilon;
  }
  return merging_balls;
}



is_game_over(velocity_epsilon = 1.5){
  for (const ball of this.balls) 
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

handle_boundreis_collision(position_epsilon = 2, velocity_epsilon = 2){
  for (const ball of this.balls) {

    let is_collision_with_boundries = false;

    //check for collision with boundries
    if (ball.x + ball.radius + position_epsilon > this.canvas.width) {    //right
      ball.x = this.canvas.width - ball.radius - position_epsilon;
      ball.vel.x *= -0.9;
      is_collision_with_boundries = true;
    }
    else if (ball.x - ball.radius - position_epsilon < 0) {          //left         
      ball.x = 0 + ball.radius + position_epsilon;
      ball.vel.x *= -0.9;
      is_collision_with_boundries = true;
    } 
    if (ball.y + ball.radius + position_epsilon > this.canvas.height) {   //buttom 
      ball.vel.y *= -0.36;
      ball.y = this.canvas.height - ball.radius - position_epsilon;
      is_collision_with_boundries = true;
    } 
    else if (ball.y + ball.radius + position_epsilon < 0) {          //top
      ball.vel.y *= -0.36;
      ball.y = this.canvas.height + ball.radius + position_epsilon;
      is_collision_with_boundries = true;
      
    }

    if(is_collision_with_boundries){
      const is_ball_with_velocity = Math.abs(ball.vel.y) > velocity_epsilon;
      if(is_ball_with_velocity){
        ball.set_smily(false);
        this.play_sound('ball-hit-boundries');    
      }
      
    }


  }
}

handle_balls_collision(velocity_epsilon = 2){
  let out_merging_balls = [];
    // Check for collisions
  for (let i = 0; i < this.balls.length; i++) 
  {
    for (let j = i + 1; j < this.balls.length; j++) 
    {
      const ball_A = this.balls[i];
      const ball_B = this.balls[j];

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
        this.play_sound('ball-bomb');
        this.handle_collsion_with_bomb(ball_A, ball_B);

      }

      else if(is_collision && (ball_A.ball_type == "נbird" || ball_B.ball_type == "bird"))
      {
        this.play_sound('bird');
        this.handle_collision_with_bird(ball_A, ball_B);

      }
      else if(is_collision && (ball_A.ball_type == "cow" || ball_B.ball_type == "cow"))
      {
        this.play_sound('cow');
        this.handle_collision_with_dynamite(ball_A, ball_B);
      }
      else if (is_collision && (ball_A.ball_type == "parrots" || ball_B.ball_type == "parrots"))
      {
        this.play_sound('parrots');
        this.handle_collision_with_parrots(ball_A, ball_B);
      }
      else if(is_collision && (ball_A.ball_type == "dynamite" || ball_B.ball_type == "dynamite"))
      {
        this.play_sound('dynamite');
        this.handle_collision_with_dynamite(ball_A, ball_B);
      }

      else if(is_collision && (ball_A.ball_type == "atomic-bomb" || ball_B.ball_type == "atomic-bomb"))
      {
        this.play_sound('atomic-bomb');
        this.handle_collision_with_atomic_bomb(ball_A, ball_B);
      }
      else if(is_collision && is_same_color) 
      {
        this.play_sound("same-color-merge-audio");
        out_merging_balls = this.handle_collidion_with_same_color(ball_A, ball_B);
      }
      else if(is_collision)
      {
        if(is_ball_with_velocity)
        {
          this.play_sound("ball-hits-ball-audio");
        }
        this.handle_collision_between_balls(ball_A, ball_B);
      }
    }
  }

  return out_merging_balls
}


handle_collision_with_bird(ball_A, ball_B){
  this.on_increase_score_callback();
  this.last_animation_timestamp = Date.now();
  bird_animation(this.ctx, this.balls);
  this.balls.forEach(ball=>ball.show_balls_explode_animation(this.ctx))
  this.balls = [];
  this.trigger_golden_butterfly_effect().then(() => this.initialize_board_balls());

  if(Math.random() < 0.20)
  {
    displayString()
  }
}


handle_collision_with_parrots(ball_A, ball_B) {
  this.on_increase_score_callback();
  this.last_animation_timestamp = Date.now();
  parrots_animation(this.ctx, ball_A)
  ball_A.show_balls_explode_animation(this.ctx);
  ball_B.show_balls_explode_animation(this.ctx);
  this.balls.splice(this.balls.findIndex(item => item === ball_A), 1);
  this.balls.splice(this.balls.findIndex(item => item === ball_B), 1);

  if(Math.random() < 0.20)
  {
    displayString()
  }
}




handle_collision_with_atomic_bomb(ball_A, ball_B){
  this.on_increase_score_callback();
  this.last_animation_timestamp = Date.now();
  atomic_bomb_animation(this.ctx);
  this.balls.forEach(ball=>ball.show_balls_explode_animation(this.ctx))
  this.balls = [];
  this.trigger_golden_butterfly_effect().then(() => this.initialize_board_balls());

  if(Math.random() < 0.20)
  {
    displayString()
  }
}

handle_collidion_with_same_color(ball_A, ball_B){
  const radius_to_explode = 60;
  const out_merging_balls = [];
  this.on_increase_score_callback();
  const newRadius = Math.sqrt(ball_A.radius ** 2 + ball_B.radius ** 2);
  ball_A.radius = newRadius;
  ball_A.colors = [getFirstIntersection(ball_A.colors, ball_B.colors)]

  this.balls.splice(this.balls.findIndex(item => item === ball_B), 1);
  out_merging_balls.push(ball_A);
  out_merging_balls.push(ball_B);
  if (ball_A.radius > radius_to_explode)
  {
    this.play_sound('ball-pop');
    this.last_animation_timestamp = Date.now();
    ball_A.show_balls_explode_animation(this.ctx);
    this.balls.splice(this.balls.findIndex(item => item === ball_A), 1);

    if (this.balls.length === 0) {
      this.trigger_golden_butterfly_effect().then(() => this.initialize_board_balls());
    }

    if(Math.random() < 0.20)
    {
      displayString()
    }
  }
  return out_merging_balls;
}

handle_collision_with_dynamite(ball_A, ball_B, position_epsilon = 5){
  this.on_increase_score_callback();
  const dynamite_ball = ball_A.ball_type == "dynamite" ? ball_A: ball_B;
  const effected_balls = [ball_A, ball_B];

  for (let k = 0; k < this.balls.length; k++) {
    const dx = this.balls[k].x - dynamite_ball.x;
    const dy = this.balls[k].y - dynamite_ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const is_collision_near_ball = distance - position_epsilon <= dynamite_ball.radius + this.balls[k].radius;

    if(is_collision_near_ball)
    {
      effected_balls.push(this.balls[k]);

      for(let l=0; l< this.balls.length; l++){
        const dx = this.balls[l].x - this.balls[k].x;
        const dy = this.balls[l].y - this.balls[k].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const is_ball_near_a_ball_near_dynamite = distance - position_epsilon <= this.balls[k].radius + this.balls[l].radius;
        if(is_ball_near_a_ball_near_dynamite){
          effected_balls.push(this.balls[l]);
        } 
      }


    }
  }

  this.last_animation_timestamp = Date.now();
  effected_balls.forEach((ball)=>{
    ball.show_balls_explode_animation(this.ctx);
  });

  this.balls = this.balls.filter(item => !effected_balls.includes(item));

  if (this.balls.length === 0) {
    this.trigger_golden_butterfly_effect().then(() => this.initialize_board_balls());
  }

  if(Math.random() < 0.20)
  {
    displayString()
  }
}

handle_collsion_with_bomb(ball_A, ball_B)

{
  this.on_increase_score_callback();
  this.last_animation_timestamp = Date.now();
  ball_A.show_balls_explode_animation(this.ctx);
  ball_B.show_balls_explode_animation(this.ctx);
  this.balls.splice(this.balls.findIndex(item => item === ball_A), 1);
  this.balls.splice(this.balls.findIndex(item => item === ball_B), 1);

  if (this.balls.length === 0) {
    this.trigger_golden_butterfly_effect().then(() => this.initialize_board_balls());
  }

  if(Math.random() < 0.20)
  {
    displayString()
  }
}

handle_collision_between_balls(ballA, ballB, position_epsilon = 0.5){

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


trigger_golden_butterfly_effect() {
  const DURATION_MS = 2000;
  const NUM_BUTTERFLIES = 18;
  const startTime = Date.now();
  const ctx = this.ctx;
  const canvasWidth = this.canvas.width;
  const canvasHeight = this.canvas.height;

  this.is_butterfly_playing = true;

  return new Promise((resolve) => {

  // Build butterfly data
  const butterflies = Array.from({ length: NUM_BUTTERFLIES }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.5) * 1.8,
    vy: -(Math.random() * 1.2 + 0.5),
    phase: Math.random() * Math.PI * 2,      // wing-flap phase offset
    flapSpeed: 0.12 + Math.random() * 0.08,  // flap speed
    size: 10 + Math.random() * 10,           // body/wing scale
    wobble: (Math.random() - 0.5) * 0.04,   // horizontal drift
    alpha: 1,
  }));

  const drawButterfly = (x, y, size, flapAngle, alpha) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);

    // Wing flap: flapAngle goes 0→PI (closed) using a sine curve
    const wingSpread = Math.abs(Math.cos(flapAngle)); // 1=fully open, 0=closed

    // Gold gradient helper
    const makeGold = (x1, y1, x2, y2) => {
      const g = ctx.createLinearGradient(x1, y1, x2, y2);
      g.addColorStop(0, '#FFD700');
      g.addColorStop(0.4, '#FFF176');
      g.addColorStop(0.7, '#FFC200');
      g.addColorStop(1, '#FF8C00');
      return g;
    };

    // ── Left wings ──
    ctx.save();
    ctx.scale(-wingSpread, 1); // mirror-flap left side

    // Upper-left wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 1.6, -size * 0.4, -size * 2, -size * 1.6, -size * 0.6, -size * 1.4);
    ctx.bezierCurveTo(-size * 0.2, -size * 1.2, -size * 0.1, -size * 0.5, 0, 0);
    ctx.fillStyle = makeGold(-size * 2, -size * 1.6, 0, 0);
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,120,0,0.5)';
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Lower-left wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-size * 1.2, size * 0.2, -size * 1.4, size * 1.2, -size * 0.4, size * 1.0);
    ctx.bezierCurveTo(-size * 0.1, size * 0.8, 0, size * 0.3, 0, 0);
    ctx.fillStyle = makeGold(-size * 1.4, size * 1.2, 0, 0);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // ── Right wings (mirror) ──
    ctx.save();
    ctx.scale(wingSpread, 1);

    // Upper-right wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 1.6, -size * 0.4, size * 2, -size * 1.6, size * 0.6, -size * 1.4);
    ctx.bezierCurveTo(size * 0.2, -size * 1.2, size * 0.1, -size * 0.5, 0, 0);
    ctx.fillStyle = makeGold(size * 2, -size * 1.6, 0, 0);
    ctx.fill();
    ctx.stroke();

    // Lower-right wing
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(size * 1.2, size * 0.2, size * 1.4, size * 1.2, size * 0.4, size * 1.0);
    ctx.bezierCurveTo(size * 0.1, size * 0.8, 0, size * 0.3, 0, 0);
    ctx.fillStyle = makeGold(size * 1.4, size * 1.2, 0, 0);
    ctx.fill();
    ctx.stroke();

    ctx.restore();

    // ── Body ──
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.12, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#5D3A00';
    ctx.fill();

    // ── Antennae ──
    ctx.strokeStyle = '#5D3A00';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-size * 0.1, -size * 0.4);
    ctx.quadraticCurveTo(-size * 0.6, -size * 1.2, -size * 0.5, -size * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(size * 0.1, -size * 0.4);
    ctx.quadraticCurveTo(size * 0.6, -size * 1.2, size * 0.5, -size * 1.5);
    ctx.stroke();
    // Antenna tips
    [[-size * 0.5, -size * 1.5], [size * 0.5, -size * 1.5]].forEach(([tx, ty]) => {
      ctx.beginPath();
      ctx.arc(tx, ty, size * 0.1, 0, Math.PI * 2);
      ctx.fillStyle = '#5D3A00';
      ctx.fill();
    });

    ctx.restore();
  };

  // Sparkle pool
  const sparkles = [];
  const addSparkle = (x, y) => {
    sparkles.push({ x, y, life: 1, size: 2 + Math.random() * 3 });
  };

  let frameId;
  const animate = () => {
    const elapsed = Date.now() - startTime;
    if (elapsed >= DURATION_MS) {
      cancelAnimationFrame(frameId);
      this.is_butterfly_playing = false;
      resolve();
      return;
    }

    // Fade out in the last 400 ms
    const globalAlpha = elapsed > DURATION_MS - 400
      ? 1 - (elapsed - (DURATION_MS - 400)) / 400
      : 1;

    // Redraw background (erase + leaves already gone, just clear)
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw score on top
    ctx.font = "32px Arial";
    ctx.fillStyle = "#5E397A";
    ctx.fillText(`Score: ${this.points}`, 8, 30);

    // Sparkles
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.life -= 0.04;
      if (s.life <= 0) { sparkles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = s.life * globalAlpha;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Update & draw butterflies
    butterflies.forEach(b => {
      b.phase += b.flapSpeed;
      b.x += b.vx + Math.sin(b.phase * 0.5) * 0.8;
      b.y += b.vy + Math.cos(b.phase * 0.3) * 0.5;
      b.vx += b.wobble;
      // Wrap around canvas edges
      if (b.x < -b.size * 2) b.x = canvasWidth + b.size;
      if (b.x > canvasWidth + b.size * 2) b.x = -b.size;
      if (b.y < -b.size * 2) b.y = canvasHeight + b.size;
      if (b.y > canvasHeight + b.size * 2) b.y = -b.size;

      // Occasionally shed a sparkle
      if (Math.random() < 0.15) addSparkle(b.x, b.y);

      drawButterfly(b.x, b.y, b.size, b.phase, globalAlpha);
    });

    frameId = requestAnimationFrame(animate);
  };

  frameId = requestAnimationFrame(animate);
  }); // end Promise
}

handle_game_over() {

  for (const ball of this.balls) 
  {
    ball.vel = (0,0);

  }
  this.is_playing = false
  this.mouse_ball = null;

  this.last_animation_timestamp = Date.now();
  this.balls.forEach(ball => {
    ball.show_balls_explode_animation(this.ctx, true);
  });
  
  

    // window.setTimeout(()=>{this.is_playing = false;}, 3000)
  
  
  this.on_game_over_callback();

  
  
  window.setTimeout(()=>{this.draw(null);}, 3000)
  
  

  window.setTimeout(()=>{
    document.addEventListener('click', reload_page);
    document.addEventListener('keydown',  reload_page);}, 2000)


  function reload_page(){
   document.removeEventListener('click', reload_page);
   document.removeEventListener('keydown', reload_page);
   window.location.reload();

 }

}
}



function getFirstIntersection(arr1, arr2) {
  const set2 = new Set(arr2);
  return arr1.find(item => set2.has(item)) || null;
}