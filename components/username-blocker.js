// username-blocker.js

export const UsernameBlocker = {
  template: `
    <div id="username-blocker" ref="blocker_container">
      <div v-if="!is_username_received" @keyup.enter="set_username(input_username)">
        <label id="username-blocker-headline" for="input-username">Enter nickname:</label>
        <input
          id="input-username"
          v-model="input_username"
          ref="text_input"
          type="text"
          maxlength="10"
          placeholder="your username.."
        />
        <hr>
        <button
          id="username-blocker-button"
          v-if="!is_username_received"
          @click="set_username(input_username)"
          type="button"
          class="btn btn-secondary"
        >
          Ok
        </button>
      </div>
    </div>
  `,
  data() {
    return {
      input_username: '',
      is_username_received: false
    }
  },
  mounted() {
    this.$refs.text_input.focus();
    this.input_username = sessionStorage.getItem('username') || '';
  },
  methods: {
    async set_username(input_username) {
      this.$refs.text_input.focus();
      if (input_username) {
        this.$emit('on-set-username', input_username);
          sessionStorage.setItem('username', input_username);
        this.is_username_received = true;
        this.$refs.blocker_container.style.visibility = "hidden";
      }
    }
  }
};

