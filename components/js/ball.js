


function Ball(x, y, radius=20, colors, line_height, ball_type, bomb_image = null) {  
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.vel = {x:0.0, y: 2}; // I set it to zero to add some gravity feel but do whatever you think is right
    this.acceleration = {x:0, y:0};

    this.tiltForceX = 0;
    
    this.colors = colors || [getRandomColor()]
    this.isDropped = false;
    this.line_height = line_height;
    this.is_crossed_line = false;
    this.is_smiling = true;
    this.last_smily_change_timestamp = Date.now();
    this.bounce_animation_interval_token = null;

    this.ball_type = ball_type; 
    
    // ADD "parrots" to this condition
    if(this.ball_type == "ball-bomb" || this.ball_type == "bird" || this.ball_type == "cow" || this.ball_type == "dynamite" || this.ball_type == "atomic-bomb" || this.ball_type == "parrots"){ 
        this.colors = [];       // Clears colors so the ball doesn't draw a solid color
        this.bomb_img = bomb_image; // Assigns the image to be drawn
    }
    this.is_flicker_border = false;
    this.last_border_blink_timestamp = 0;
}


// when changing the physics, change these constants accordingly to what feels right
Ball.gravity = 0.02;
Ball.airFriction = 0.96;
Ball.tiltMangnitude = 0.3;
Ball.maxVelocity = 10;


Ball.prototype.update_tilt = function(new_tilt_angle){
    this.tiltForceX = Ball.tiltMangnitude * new_tilt_angle; 
}


Ball.prototype.get_mass = function(){
    return this.radius;
}

Ball.prototype.update_acceleration = function(){
    const mass = this.get_mass();
    this.acceleration.x = this.tiltForceX / mass;
    this.acceleration.y = (Ball.gravity * mass) / mass;
}

Ball.prototype.update_velocity = function(time_frame){
    this.vel.x += this.acceleration.x * time_frame;
    this.vel.y += this.acceleration.y * time_frame;

    this.vel.x *= Ball.airFriction;
    this.vel.y *= Ball.airFriction;

    this.vel.x = this.vel.x > Ball.maxVelocity ? Ball.maxVelocity : this.vel.x < -Ball.maxVelocity ? -Ball.maxVelocity : this.vel.x;
    this.vel.y = this.vel.y > Ball.maxVelocity ? Ball.maxVelocity : this.vel.y < -Ball.maxVelocity ? -Ball.maxVelocity : this.vel.y;
}


// Ball.prototype.update_velocity = function (frame_time) {
//     // console.log(frame_time);
//     this.vel.x = this.vel.x > maxVelX ? maxVelX : this.vel.x < -maxVelX ? -maxVelX : this.vel.x;
//     this.vel.x *= airFrictionX;
//     this.vel.y += gravity;
//     this.vel.y = this.vel.y > maxVelY ? maxVelY : this.vel.y < -maxVelY ? -maxVelY : this.vel.y;
// }

Ball.prototype.update_position = function (time_frame) {
    
    this.update_acceleration();
    this.update_velocity(time_frame);

    this.x += this.vel.x;
    this.y += this.vel.y;


    if(this.is_ball_below_line()){
        this.is_crossed_line = true;
    }
};

Ball.prototype.drop = function () {
    if (!this.isDropped) {
      this.isDropped = true;
  }
};


Ball.prototype.is_ball_below_line = function() {
    return (this.y - this.radius >= this.line_height);
};

Ball.prototype.is_line_intersect = function() {
    return (this.y + this.radius >= this.line_height) && (this.y - this.radius <= this.line_height);
};

Ball.prototype.set_smily = function (is_balls_colision = false, ball_it_collided_with = null ,epsilon = 0.5) {
    const duration_from_last_smily_switch =  Date.now() - this.last_smily_change_timestamp;

    const is_ball_static = (Math.abs(this.vel.y) < epsilon && Math.abs(this.vel.x) < epsilon);
    const is_can_switch_by_last_switch_time = duration_from_last_smily_switch > 200
    const is_ball_it_collided_with_is_static = is_balls_colision && (Math.abs(ball_it_collided_with.vel.x) < epsilon && Math.abs(ball_it_collided_with.vel.y) < epsilon);

    if (!is_balls_colision && is_ball_static && is_can_switch_by_last_switch_time){ 
        return;
    } 
    else if(!is_balls_colision && !is_ball_static && is_can_switch_by_last_switch_time){
        this.is_smiling = !this.is_smiling;
        this.last_smily_change_timestamp = Date.now();
    } 
    else if(is_balls_colision && !is_ball_it_collided_with_is_static && !is_ball_static && is_can_switch_by_last_switch_time ){
        return;
    }   
    else if(is_balls_colision &&  !is_ball_it_collided_with_is_static && is_ball_static && is_can_switch_by_last_switch_time  ){

        this.is_smiling = !this.is_smiling;
        this.last_smily_change_timestamp = Date.now();

    }
    // else if (!is_balls_colision && is_can_switch_by_last_switch_time)
    // {
    //         this.is_smiling = !this.is_smiling;
    //         this.last_smily_change_timestamp = Date.now(); 
    // }
}


Ball.prototype.start_bounce_animation = function(bounce_size = 8) {
    const originalY = this.y;  // Store the original y position
    let direction = 1;         // 1 for down, -1 for up
    const bounceSpeed = 0.5;     // Speed of the bounce

    // Clear any existing animation interval to prevent multiple intervals running
    if (this.bounce_animation_interval_token) {
        clearInterval(this.bounce_animation_interval_token);
    }

    // Define the bouncing behavior in an interval
    this.bounce_animation_interval_token = setInterval(() => {
        // Check if the ball needs to change direction
        if (direction === 1 && this.y >= originalY + bounce_size) {
            direction = -1;  // Change direction to up
        } else if (direction === -1 && this.y <= originalY) {
            direction = 1;  // Change direction to down
        }

        // Update the y position of the ball
        this.y += bounceSpeed * direction;

        // Optional: redraw or update the ball in your canvas or context
        // e.g., redrawBall(this);
    }, 20);  // The interval time in milliseconds
}


Ball.prototype.stop_bounce_animation = function(bounce_size){
    clearInterval(this.bounce_animation_interval_token)
}


Ball.prototype.draw = function (ctx) {



    if(this.ball_type == "ball-bomb" || this.ball_type == "bird" || this.ball_type == "cow" || this.ball_type == "dynamite" || this.ball_type == "atomic-bomb"){
        this.paint_bomb(ctx, this.x, this.y, this.radius, this.bomb_img);
        
    }else{
        this.draw_ball(ctx)
        this.draw_border(ctx);
    }

    
};

Ball.prototype.draw_border = function(ctx){
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'black' 
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.closePath();
}
Ball.prototype.show_balls_explode_animation = function(ctx, is_leave_marks = false) {
    let particles = [];
    const numParticles = 100; // Number of particles to splatter

    // Initialize particles
    for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * 2 * Math.PI; // Random direction
        const speed = Math.random() * 10 + 2; // Random speed between 2 and 5
        const particle = {
            x: this.x,
            y: this.y,
            radius: Math.random() * 5 + 1, // Random radius between 1 and 4
            color: this.colors[0],
            velocity: {
                x: speed * Math.cos(angle),
                y: speed * Math.sin(angle)
            },
            alpha: 1, // Opacity
            decay: Math.random() * 0.02 + 0.01 // Decay rate of opacity
        };
        particles.push(particle);
    }

    // Function to update particle positions
    function updateParticles() {
        particles.forEach(particle => {
            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.alpha -= particle.decay;
        });
        particles = particles.filter(particle => particle.alpha > 0);
    }

    // Function to draw particles
    function drawParticles() {
        particles.forEach(particle => {
            ctx.globalAlpha = particle.alpha;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.globalAlpha = 1; // Reset alpha to default
        });
    }

    // Animation loop
    function animate() {
        if (particles.length > 0) {
            if(!is_leave_marks){
             ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear the canvas
         }
         updateParticles();
         drawParticles();
         requestAnimationFrame(animate);
     }
 }

 animate();
}



Ball.prototype.paint_bomb = function(ctx, centerX, centerY, radius, bomb_image) {
    ctx.save();

    // Begin drawing the circular clipping path
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.clip();  // Clip the region

    // Draw the image within the clipped region
    // Stretching the image to fit within the circle
    ctx.drawImage(bomb_image, centerX - radius, centerY - radius, radius * 2, radius * 2);

    // Restore the previous canvas state
    ctx.restore();
}


Ball.prototype.draw_ball = function(ctx){
    // If this ball has a bomb/special image (like the 'parrots ball'), draw the image and exit.
    if (this.bomb_img) {
        // Ensure the image object is ready before drawing
        if (this.bomb_img.complete && this.bomb_img.naturalHeight !== 0) {
            ctx.drawImage(
                this.bomb_img, 
                this.x - this.radius, // X coordinate of the top-left corner
                this.y - this.radius, // Y coordinate of the top-left corner
                this.radius * 2,      // Width (Diameter)
                this.radius * 2       // Height (Diameter)
            );
            return; // Exit the function after drawing the image
        }
    }
    
    // --- Standard Colored Ball Drawing Logic ---
    const default_ball_radius = 30;
    const ball_merge_radius_addition = Math.sqrt(default_ball_radius);
    const radius_to_explode = 60;

    // Draw the ball's segments (colors)
    const segmentAngle = (Math.PI * 2) / this.colors.length;
    for (let i = 0; i < this.colors.length; i++) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, segmentAngle * i, segmentAngle * (i + 1));
        ctx.lineTo(this.x, this.y);
        ctx.fillStyle = this.colors[i];
        ctx.fill();
        ctx.closePath();
    }

    // --- Border Drawing Logic ---
    const line_width = 20 * (this.radius - default_ball_radius) / radius_to_explode + 2;
    const transpernt_ration = (this.radius - default_ball_radius) / radius_to_explode;

    ctx.beginPath();
    ctx.lineWidth = line_width;
    ctx.strokeStyle = `rgba(255, 0, 0, ${transpernt_ration})`; 
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();

    // Border blink logic
    if(this.radius + ball_merge_radius_addition >= radius_to_explode)
    {
        const is_enough_time_between_blink = new Date() - this.last_border_blink_timestamp > 500;
        if(is_enough_time_between_blink){
            this.is_flicker_border = !this.is_flicker_border;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.lineWidth = line_width;
            ctx.strokeStyle = this.is_flicker_border ? 'black': 'red';
            ctx.stroke();
            ctx.closePath();
            this.last_border_blink_timestamp = new Date();
        }    
    }

    // --- Draw Smily Logic ---
    ctx.strokeStyle = "black"
    ctx.lineWidth = 3;
    
    const eyeRadius = this.radius * 0.1;
    const eyeXOffset = this.radius * 0.3;
    const eyeYOffset = this.radius * 0.3;

    // Draw the left eye
    ctx.beginPath();
    ctx.arc(this.x - eyeXOffset, this.y - eyeYOffset, eyeRadius, 0, Math.PI * 2, true);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();

    // Draw the right eye
    ctx.beginPath();
    ctx.arc(this.x + eyeXOffset, this.y - eyeYOffset, eyeRadius, 0, Math.PI * 2, true);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();

    // Draw the mouth
    const mouthRadius = this.radius * 0.5;
    const mouthYOffset = this.radius * 0.2;

    ctx.beginPath();
    if(this.is_smiling) {
        // Draw a happy mouth
        ctx.arc(this.x, this.y + mouthYOffset, mouthRadius, 0, Math.PI, false);
    } else {
        // Draw a sad mouth
        ctx.arc(this.x, this.y + mouthYOffset * 3, mouthRadius, 0, Math.PI, true);
    }
    ctx.stroke();
    ctx.closePath();
}


// function paint_bomb(ctx, centerX, centerY, radius) {
//     // Draw the bomb body
//     ctx.beginPath();
//     ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
//     ctx.fillStyle = 'black';
//     ctx.fill();
//     ctx.closePath();

//     // Draw the fuse
//     ctx.beginPath();
//     ctx.moveTo(centerX, centerY - radius); // Start from the top center of the bomb
//     ctx.lineTo(centerX + 0.3 * radius, centerY - 1.5 * radius); // Go up and to the right
//     ctx.strokeStyle = 'gray';
//     ctx.lineWidth = radius * 0.1; // Adjust the fuse thickness based on the bomb's radius
//     ctx.stroke();
//     ctx.closePath();

//     // Draw the main spark
//     ctx.beginPath();
//     ctx.arc(centerX + 0.3 * radius, centerY - 1.5 * radius, radius * 0.15, 0, Math.PI * 2);
//     ctx.fillStyle = 'orange';
//     ctx.fill();
//     ctx.closePath();

//     // Additional sparks
//     ctx.beginPath();
//     ctx.arc(centerX + 0.35 * radius, centerY - 1.6 * radius, radius * 0.1, 0, Math.PI * 2);
//     ctx.fillStyle = 'yellow';
//     ctx.fill();
//     ctx.closePath();

//     ctx.beginPath();
//     ctx.arc(centerX + 0.25 * radius, centerY - 1.7 * radius, radius * 0.12, 0, Math.PI * 2);
//     ctx.fillStyle = 'red';
//     ctx.fill();
//     ctx.closePath();
// }

 Ball.prototype.updateGameOverAnimation = function() {
    if (this.expand) {
        this.radius += 2;  // Incrementing radius
        if (this.radius >= this.originalRadius * 1.5) {
            this.expand = false;  // Change direction to shrink
        }
    } else {
        if (this.radius > 2) {  // Ensure radius does not go below zero
            this.radius -= 2;  // Decrementing radius
        }
        if (this.radius <= this.originalRadius) {
            this.radius = this.originalRadius;
            this.expand = true;  // Reset to expand again
            return true;  // Indicate one full cycle is completed
        }
    }
    return false;
};

