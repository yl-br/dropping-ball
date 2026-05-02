// components/js/game-engine.js

import * as CollisionManager from './collision-manager.js';
import * as VisualEffects from './visual-effects.js';
import * as GameLogic from './game-logic.js';

export class GameEngine {
    static BallBombImage = new Image();
    static BirdImage = new Image();
    static DynamiteImage = new Image();
    static ParrotsImage = new Image();
    static CowImage = new Image();
    static AtomicBombImage = new Image();
    static WindImage = new Image();

    /* --- Delegated Methods --- */
    trigger_golden_butterfly_effect(...args) { return VisualEffects.trigger_golden_butterfly_effect(this, ...args); }
    update_balls_movment(...args) { return CollisionManager.update_balls_movment(this, ...args); }
    handle_boundreis_collision(...args) { return CollisionManager.handle_boundreis_collision(this, ...args); }
    handle_balls_collision(...args) { return CollisionManager.handle_balls_collision(this, ...args); }
    handle_collision_with_bird(...args) { return CollisionManager.handle_collision_with_bird(this, ...args); }
    handle_collision_with_parrots(...args) { return CollisionManager.handle_collision_with_parrots(this, ...args); }
    handle_collision_with_atomic_bomb(...args) { return CollisionManager.handle_collision_with_atomic_bomb(this, ...args); }
    handle_collidion_with_same_color(...args) { return CollisionManager.handle_collidion_with_same_color(this, ...args); }
    handle_collision_with_dynamite(...args) { return CollisionManager.handle_collision_with_dynamite(this, ...args); }
    handle_collsion_with_bomb(...args) { return CollisionManager.handle_collsion_with_bomb(this, ...args); }
    handle_collision_between_balls(...args) { return CollisionManager.handle_collision_between_balls(this, ...args); }
    initialize_board_balls(...args) { return GameLogic.initialize_board_balls(this, ...args); }
    create_random_ball(...args) { return GameLogic.create_random_ball(this, ...args); }
    determine_ball_type(...args) { return GameLogic.determine_ball_type(this, ...args); }
    is_game_over(...args) { return GameLogic.is_game_over(this, ...args); }
    handle_game_over(...args) { return GameLogic.handle_game_over(this, ...args); }
    increase_point(...args) { return GameLogic.increase_point(this, ...args); }

    constructor(canvas, line_height = 200, on_increase_score_callback, on_game_over_callback) {
        this.line_height = line_height;
        this.on_increase_score_callback = on_increase_score_callback;
        this.on_game_over_callback = on_game_over_callback;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.is_playing = true;
        this.balls = [];
        this.leafs = [];
        this.mouse_ball = null;
        this.points = 0;
        this.audioPlayers = {};
    }

    on_mouse_ball_move(mouse_ball_x, mouse_ball_y) {
        if (!this.mouse_ball) return;
        this.mouse_ball.x = mouse_ball_x;
        this.mouse_ball.y = mouse_ball_y;
        this.mouse_ball.stop_bounce_animation();

        clearTimeout(this.mouse_move_timeout);
        this.mouse_move_timeout = setTimeout(() => {
            if (this.mouse_ball) this.mouse_ball.start_bounce_animation();
        }, 50);

        this.draw();
        this.handle_mouse_icon();
    }

    on_mouse_ball_drop(drop_position_x, drop_position_y) {
        if (!this.mouse_ball) return;
        this.mouse_ball.stop_bounce_animation();

        if (this.mouse_ball.y < this.line_height) {
            this.balls.push(this.mouse_ball);
            this.mouse_ball.drop();
            this.mouse_ball.update_tilt(this.tiltAngle);
            this.mouse_ball = this.create_random_ball(drop_position_x, drop_position_y);
            this.mouse_ball.start_bounce_animation();
        }
        this.handle_mouse_icon();
        return this.mouse_ball;
    }

    play_sound(soundName) {
        const sound = this.audioPlayers[soundName];
        if (sound && sound.readyState > 0) {
            sound.currentTime = 0;
            sound.play().catch(e => {
                if (e.name !== 'NotSupportedError') {
                    console.error(`Playback failed for ${soundName}:`, e.message);
                }
            });
        }
    }

    async initialize_game() {
        this.balls = [];
        this.leafs = [];
        this.mouse_ball = null;
        this.tiltAngle = 0;
        this.points = 0;
        this.last_drawing_timestamp = -1;

        // Image Setup
        GameEngine.BallBombImage.src = "/assets/images/bomb_ball.png";
        GameEngine.BirdImage.src = "/assets/images/bird.png";
        GameEngine.DynamiteImage.src = "/assets/images/dynamite.png";
        GameEngine.ParrotsImage.src = "/assets/images/parrots.png";
        GameEngine.CowImage.src = "/assets/images/cow.png";
        GameEngine.AtomicBombImage.src = "/assets/images/atomic-bomb.png";
        GameEngine.WindImage.src = "/assets/images/wind.png";

        // Sound files mapped to your actual .wav filenames
        const soundFiles = {
            'ball-hit-boundries': '/assets/audio/ball-hit-boundries.wav',
            'ball-bomb': '/assets/audio/ball-bomb.wav',
            'bird': '/assets/audio/bird.wav',
            'cow': '/assets/audio/cow.wav',
            'parrots': '/assets/audio/parrots.wav',
            'dynamite': '/assets/audio/dynamite.wav',
            'atomic-bomb': '/assets/audio/atomic-bomb.wav',
            'same-color-merge-audio': '/assets/audio/same-color-merge.wav',
            'ball-hits-ball-audio': '/assets/audio/ball-hits-ball.wav',
            'ball-pop': '/assets/audio/ball-pop.wav'
        };

        this.audioPlayers = {};
        for (const [name, path] of Object.entries(soundFiles)) {
            const audio = new Audio(path);
            audio.addEventListener('error', () => {
                console.warn(`Audio Error: Server could not find file at ${audio.src}`);
            });
            this.audioPlayers[name] = audio;
        }

        if (typeof this.trigger_golden_butterfly_effect === 'function') {
            await this.trigger_golden_butterfly_effect();
        }
        this.initialize_board_balls();
    }

    start_game() {
        if (this.mouse_ball) this.mouse_ball.start_bounce_animation();
        this.gameLoop();
    }

    stop_game() { this.is_playing = false; }

    gameLoop() {
        if (!this.is_playing || this.is_butterfly_playing) {
            if (this.is_butterfly_playing) requestAnimationFrame(this.gameLoop.bind(this));
            return;
        }
        if (this.is_game_over()) {
            this.handle_game_over();
            return;
        }
        const frame_time_duration = new Date() - this.last_drawing_timestamp;
        this.last_drawing_timestamp = new Date();
        const merging_balls = this.update_balls_movment();
        this.balls.forEach(ball => ball.update_position(frame_time_duration));
        this.draw(merging_balls);
        this.handle_mouse_icon();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    draw(merging_balls, animation_duration = 500) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (typeof drawLine === 'function') drawLine(this.ctx, this.line_height);

        if (this.mouse_ball) this.mouse_ball.draw(this.ctx);
        this.balls.forEach(ball => ball.draw(this.ctx));
        this.drawScore();
    }

    drawScore() {
        this.ctx.font = "32px Arial";
        this.ctx.fillStyle = "#5E397A";
        this.ctx.fillText(`Score: ${this.points}`, 8, 30);
    }

    handle_mouse_icon() {
        if (!this.mouse_ball) return;
        const is_below = this.mouse_ball.y >= this.line_height;
        this.canvas.style.cursor = is_below ? 'none' : 'pointer';
        if (is_below && typeof drawX === 'function') drawX(this.ctx, this.mouse_ball.x, this.mouse_ball.y);
    }
}