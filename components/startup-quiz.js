// components/startup-quiz.js

export const StartupQuiz = {
  template: `
    <div id="startup-quiz-container" v-if="show_quiz" class="startup-quiz-overlay">
      <div class="startup-quiz-modal">
        <div class="quiz-header">
          <h1>Math Challenge</h1>
          <p class="quiz-subtitle">Answer this question to start the game</p>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: progress_percentage + '%' }"></div>
          </div>
          <p class="progress-text">Question {{ current_question_index + 1 }} of {{ total_questions }}</p>
        </div>

        <div class="quiz-body">
          <div class="question-container">
            <h2 class="question-text">{{ current_question.question }}</h2>
          </div>

          <div class="options-container">
            <button
              v-for="(option, index) in current_question.options"
              :key="index"
              class="option-button"
              :class="{ 
                'selected': selected_answer === index,
                'correct': show_result && index === current_question.correct,
                'incorrect': show_result && selected_answer === index && index !== current_question.correct
              }"
              @click="select_answer(index)"
              :disabled="show_result"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
              <span class="option-text">{{ option }}</span>
            </button>
          </div>

          <div v-if="show_result" class="result-message" :class="is_correct ? 'correct-result' : 'incorrect-result'">
            <p v-if="is_correct" class="message">✓ Correct!</p>
            <p v-else class="message">✗ Incorrect. The correct answer is {{ String.fromCharCode(65 + current_question.correct) }}.</p>
          </div>
        </div>

        <div class="quiz-footer">
          <button
            v-if="!show_result"
            class="submit-button"
            @click="submit_answer"
            :disabled="selected_answer === null"
          >
            Submit Answer
          </button>
          <button
            v-else
            class="submit-button next-button"
            @click="next_question"
          >
            {{ current_question_index < total_questions - 1 ? 'Next Question' : 'Start Game' }}
          </button>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      show_quiz: true,
      questions: [],
      current_question_index: 0,
      selected_answer: null,
      show_result: false,
      is_correct: false,
      correct_count: 0,
      total_questions: 0,
      loading: true
    };
  },

  computed: {
    current_question() {
      return this.questions[this.current_question_index] || {};
    },
    progress_percentage() {
      return ((this.current_question_index + 1) / this.total_questions) * 100;
    }
  },

  emits: ['on-quiz-complete'],

  methods: {
    async load_questions() {
      try {
        const response = await fetch('./calculus-questions.json');
        const data = await response.json();
        this.questions = data.questions;
        this.total_questions = this.questions.length;
        this.loading = false;
        this.shuffle_questions();
        this.shuffle_options();
      } catch (error) {
        console.error('Error loading questions:', error);
        // Fallback: use hardcoded questions if file not found
        this.load_fallback_questions();
      }
    },

    shuffle_questions() {
      // Fisher-Yates shuffle
      for (let i = this.questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.questions[i], this.questions[j]] = [this.questions[j], this.questions[i]];
      }
    },

    shuffle_options() {
      const q = this.current_question;
      const options = [...q.options];
      const correct_option = options[q.correct];
      
      // Shuffle options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }
      
      // Update correct index
      q.correct = options.indexOf(correct_option);
      q.options = options;
    },

    load_fallback_questions() {
      this.questions = [
        {
          id: 1,
          question: "What is the derivative of x³?",
          options: ["3x²", "x²", "3x", "x³/3"],
          correct: 0,
          difficulty: "easy"
        },
        {
          id: 2,
          question: "What is the derivative of sin(x)?",
          options: ["cos(x)", "-cos(x)", "sin(x)", "tan(x)"],
          correct: 0,
          difficulty: "easy"
        },
        {
          id: 3,
          question: "What is the integral of 2x?",
          options: ["x² + C", "2x + C", "x + C", "2 + C"],
          correct: 0,
          difficulty: "easy"
        }
      ];
      this.total_questions = this.questions.length;
      this.loading = false;
      this.shuffle_questions();
    },

    select_answer(index) {
      if (!this.show_result) {
        this.selected_answer = index;
      }
    },

    submit_answer() {
      if (this.selected_answer === null) return;

      this.is_correct = this.selected_answer === this.current_question.correct;
      this.show_result = true;

      if (this.is_correct) {
        this.correct_count++;
      }

      // Auto-advance after a delay
      setTimeout(() => {
        this.next_question();
      }, 2000);
    },

    next_question() {
      if (this.current_question_index < this.total_questions - 1) {
        this.current_question_index++;
        this.selected_answer = null;
        this.show_result = false;
        this.is_correct = false;
        this.shuffle_options();
      } else {
        // Quiz complete
        this.complete_quiz();
      }
    },

    complete_quiz() {
      this.show_quiz = false;
      this.$emit('on-quiz-complete', {
        correct: this.correct_count,
        total: this.total_questions,
        percentage: Math.round((this.correct_count / this.total_questions) * 100)
      });
    }
  },

  mounted() {
    this.load_questions();
  }
};
