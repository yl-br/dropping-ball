// ImagesCollage.js


export const ImagesCollage = {
  data() {
    return {
      images: [
        './assets/images/atomic-bomb.png',
        './assets/images/atomic-cloud.png',
        './assets/images/bird.png',
        './assets/images/bomb_ball.png',
        './assets/images/cow.png',
        './assets/images/dynamite.png',
        './assets/images/parrots.png',
        './assets/images/wind.png'
      ]
    };
  },
  template: `
    <div class="collage">
      <img v-for="img in images" :src="img" :key="img" class="collage-img">
    </div>
  `,
  mounted() {
    console.log('ImagesCollage mounted');
  }
};

