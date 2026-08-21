// components/math-quiz.js

export const MathQuiz = {
  template: `
    <div id="math-quiz-blocker" ref="quiz_container" v-if="show_quiz">
      <div class="quiz-content">
        <h2>Quick Math Check!</h2>
        <p class="quiz-question">{{ question }}</p>
        
        <input
          v-model="user_answer"
          @keyup.enter="submit_answer"
          ref="answer_input"
          type="number"
          step="0.1"
          placeholder="Your answer..."
          class="quiz-input"
        />
        
        <button
          @click="submit_answer"
          class="btn btn-primary quiz-button"
        >
          Submit
        </button>

        <p v-if="error_message" class="quiz-error">{{ error_message }}</p>
      </div>
    </div>
  `,
  
  data() {
    return {
      show_quiz: false,
      question: '',
      correct_answer: 0,
      user_answer: '',
      error_message: '',
      num1: 0,
      num2: 0,
      operation: '+',
      tolerance: 0.01 // for floating point comparisons
    };
  },

  emits: ['on-quiz-correct', 'on-quiz-incorrect'],

  methods: {
    generate_question() {
      this.error_message = '';
      this.user_answer = '';
      
      // Random operation: +, -, *
      const operations = ['+', '-', '*'];
      this.operation = operations[Math.floor(Math.random() * operations.length)];

      if (this.operation === '+') {
        this.num1 = Math.floor(Math.random() * 20) + 1;
        this.num2 = Math.floor(Math.random() * 20) + Math.random(); // allows decimals
        this.correct_answer = this.num1 + this.num2;
        this.question = `${this.num1} + ${this.num2.toFixed(1)} = ?`;
      } else if (this.operation === '-') {
        this.num1 = Math.floor(Math.random() * 30) + 10;
        this.num2 = Math.floor(Math.random() * this.num1);
        this.correct_answer = this.num1 - this.num2;
        this.question = `${this.num1} - ${this.num2} = ?`;
      } else if (this.operation === '*') {
        this.num1 = Math.floor(Math.random() * 15) + 1;
        this.num2 = Math.floor(Math.random() * 15) + 1;
        this.correct_answer = this.num1 * this.num2;
        this.question = `${this.num1} × ${this.num2} = ?`;
      }
    },

    show_quiz_modal() {
      this.show_quiz = true;
      this.generate_question();
      this.$nextTick(() => {
        if (this.$refs.answer_input) {
          this.$refs.answer_input.focus();
        }
      });
    },

    submit_answer() {
      const user_val = parseFloat(this.user_answer);

      if (isNaN(user_val)) {
        this.error_message = 'Please enter a valid number';
        return;
      }

      // Check if answer is correct (with tolerance for floating point)
      const is_correct = Math.abs(user_val - this.correct_answer) < this.tolerance;

      if (is_correct) {
        this.show_quiz = false;
        this.$emit('on-quiz-correct');
      } else {
        this.error_message = `❌ Incorrect. Correct answer: ${this.correct_answer.toFixed(1)}`;
        // Emit incorrect answer after a delay so user can see the message
        setTimeout(() => {
          this.$emit('on-quiz-incorrect');
        }, 2000);
      }
    }
  }
};
