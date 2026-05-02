// main.js

//--------------------------------------------------------------------------------------------------------------------------------
// window.isProduction = true;
// window.baseAddress =  isProduction ? 'https://dropping-balls-459155b20b56.herokuapp.com/': 'http://localhost:80/';
//--------------------------------------------------------------------------------------------------------------------------------



import { App } from './app.js'; // This fixes the ReferenceError: App is not defined[cite: 11, 16]

document.addEventListener("DOMContentLoaded", () => {
    // Ensuring play_introduction is called when DOM is ready
    if (typeof play_introduction === 'function') {
        play_introduction();
    }
});

const app = Vue.createApp(App);

window.setTimeout(() => {
    app.mount('#app');

    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth"
    });
}, 11000);
