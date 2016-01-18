import get from './lib/get';

export default class Music {
  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';

    if (window.AudioContext || window.webkitAudioContext) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();

      this.analyser = this.context.createAnalyser();
      this.analyser.smoothingTimeConstant = 0.1;
      this.analyser.fftSize = 2048;
      this.analyser.connect(this.context.destination);

      this.src = this.context.createMediaElementSource(this.audio);
      this.src.connect(this.context.destination);
      this.src.connect(this.analyser);

      this.frequency = new Uint8Array(this.analyser.frequencyBinCount);
    }

    this.songs = [
      'https://soundcloud.com/leagueoflegends/dj-sona-kinetic-the-crystal',
      'https://soundcloud.com/alpineband/gasoline-2',
      'https://soundcloud.com/odesza/say_my_name',
      'https://soundcloud.com/edbangerrecords/sebastian-embody',
      'https://soundcloud.com/0data0/dont-sing-feat-benny-sings',
      'https://soundcloud.com/c2cdjs/down-the-road',
      'https://soundcloud.com/madeon/pay-no-mind',
      'https://soundcloud.com/futureclassic/hayden-james-something-about-you-2',
      'https://soundcloud.com/kflay/5-am-w-something-a-la-mode',
      'https://soundcloud.com/majorlazer/major-lazer-dj-snake-lean-on-feat-mo',
      'https://soundcloud.com/themagician/lykke-li-i-follow-rivers-the-magician-remix',
      'https://soundcloud.com/rac/lana-del-rey-blue-jeans-rac',
      'https://soundcloud.com/coyotekisses/coyote-kisses-the-deep'
    ];

    this.song = Math.floor(Math.random() * this.songs.length);
    this.songPrev = null;
    this.songNext = null;

    this.load(this.song);
  }

  isPaused() {
    return this.audio.paused;
  }

  isPlaying() {
    return !this.audio.paused;
  }

  getFrequency() {
    this.analyser.getByteFrequencyData(this.frequency);

    return this.frequency;
  }

  load(song) {
    const audio = this.audio;
    const songs = this.songs;

    get(
      '//api.soundcloud.com/resolve.json?url=' + songs[song] + '&client_id=78c6552c14b382e23be3bce2fc411a82',
      (request) => {
        const data = JSON.parse(request.responseText);
        const title = document.querySelector('.music-title');
        const user = document.querySelector('.music-user');

        audio.src = data.stream_url + '?client_id=78c6552c14b382e23be3bce2fc411a82';
        audio.play();

        title.setAttribute('href', data.permalink_url);
        title.textContent = data.title;

        user.setAttribute('href', data.user.permalink_url);
        user.textContent = data.user.username;
      }
    );

    this.song = song;
    this.songPrev = (this.song !== 0) ? this.song - 1 : this.songs.length - 1;
    this.songNext = (this.song < this.songs.length - 1) ? this.song + 1 : 0;
  }

  next() {
    this.load(this.songNext);
  }

  prev() {
    this.load(this.songPrev);
  }

  pause() {
    this.audio.pause();
  }

  play() {
    this.audio.play();
  }
}
