//--------------------------------------------------------------------------------------------------------------------------------
// window.isProduction = true;
// window.baseAddress =  isProduction ? 'https://dropping-balls-459155b20b56.herokuapp.com/': 'http://localhost:80/';
//--------------------------------------------------------------------------------------------------------------------------------    



// -----------------------------------------------------------------------------------------------------


document.addEventListener("DOMContentLoaded", () => {
    // code runs when DOM is ready
    play_introduction();
});

const app = Vue.createApp(App);

window.setTimeout(()=>{
    app.mount('#app')

    // To do: Adjust scrolling to screen layout animation.
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: "smooth"
    });

}, 11000)
