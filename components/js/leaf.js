function Leaf(x, y, radius) {
    this.x = x;
    this.y = y;
    this.vel = {x:0.0, y: 0.0};
    this.radius = radius;
}



Leaf.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'silver';
    ctx.fill();
    ctx.closePath();
};



const maxLeafVelX = 1.2;
const maxLeafVelY = 1.2;
Leaf.prototype.update_velocity = function (time_frame, gravity, tiltMagnitutde, tiltAngle, airFriction) {
    const tiltForceX = tiltMagnitutde * tiltAngle;

    const accelerationX = tiltForceX / this.radius;
    const accelerationY = gravity / this.radius;

    this.vel.x += accelerationX * time_frame;
    this.vel.y += accelerationY * time_frame;

    this.vel.x *= airFriction;
    this.vel.y *= airFriction;

    this.vel.x = this.vel.x > maxLeafVelX ? maxLeafVelX : this.vel.x < -maxLeafVelX ? -maxLeafVelX : this.vel.x;
    this.vel.y = this.vel.y > maxLeafVelY ? maxLeafVelY : this.vel.y < -maxLeafVelY ? -maxLeafVelY : this.vel.y;
}

Leaf.prototype.update_position = function (time_frame, gravity, tiltMagnitutde, tiltAngle, airFriction, canvasWidth, canvasHeight) {
    this.update_velocity(time_frame, gravity, tiltMagnitutde, tiltAngle, airFriction);
    const camDistance = (this.radius / 10);
    this.x += this.vel.x * camDistance;
    this.y += this.vel.y * camDistance;

    if (this.x > canvasWidth) 
        this.x = 0;
    else if (this.x < 0)
        this.x = canvasWidth;
    else if (this.y > canvasHeight) 
        this.y = 10;
};