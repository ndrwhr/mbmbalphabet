/**
 * A mapping of letters to their start time and their duration.
 */
const LETTER_START_TIMES = {
  a: [0, 652],
  b: [696, 1036],
  c: [1776, 700],
  d: [2520, 1108],
  e: [3672, 1372],
  f: [5088, 1300],
  g: [6432, 1228],
  h: [7704, 1516],
  i: [9264, 2452],
  j: [11760, 940],
  k: [12744, 1060],
  l: [13848, 676],
  m: [14568, 652],
  n: [15264, 1180],
  o: [16488, 1900],
  p: [18432, 748],
  q: [19224, 604],
  r: [19872, 1108],
  s: [21024, 2884],
  t: [23952, 484],
  u: [24480, 388],
  v: [24912, 700],
  w: [25656, 940],
  x: [26640, 1012],
  y: [27696, 3028]
};

class SoundManager {
  constructor() {
    this.audioContext = new AudioContext();
    this.audioBuffer;
    this.previousSource;
  }

  load() {
    const audioEl = document.createElement('audio');
    const supportsOgg = !!audioEl
      .canPlayType('audio/ogg; codecs="vorbis"')
      .replace(/^no$/, '');
    const audioUrl = `assets/alphabet.${supportsOgg ? 'ogg' : 'mp3'}`;
    return fetch(audioUrl)
      .then(response => response.arrayBuffer())
      .then(
        arrayBuffer =>
          new Promise(res => {
            this.audioContext.decodeAudioData(arrayBuffer, buffer => {
              this.audioBuffer = buffer;
              res();
            });
          })
      );
  }

  start(start, duration) {
    this.stop();

    const source = this.audioContext.createBufferSource();
    source.buffer = this.audioBuffer;
    source.connect(this.audioContext.destination);
    source.start(0, start / 1000, duration / 1000);

    this.previousSource = source;
  }

  stop() {
    if (this.previousSource) {
      this.previousSource.stop();
      this.previousSource = null;
    }
  }
}

class App {
  static createAndLoad() {
    const soundManager = new SoundManager();
    return soundManager.load().then(
      () =>
        new App({
          soundManager
        })
    );
  }

  constructor({ soundManager }) {
    document.querySelector('.app').classList.remove('app--loading');

    const cellEls = Array.from(document.querySelectorAll('.grid__cell'));
    this.cellMap = cellEls.reduce((acc, el) => {
      acc[el.dataset.letter] = el;
      return acc;
    }, {});
    this.cellTimeoutMap = {};
    this.isLoaded = false;
    this.soundManager = soundManager;

    document.addEventListener('keyup', ({ key }) => {
      this.say(key.toLowerCase());
    });

    document.querySelector('.grid').addEventListener('click', evt => {
      if (evt.target.matches('.grid__cell')) {
        this.say(evt.target.dataset.letter);
      }
    });
  }

  say(letter) {
    if (!LETTER_START_TIMES[letter]) return;

    if (window.ga) {
      ga('send', 'event', {
        eventCategory: 'speech',
        eventAction: 'play',
        eventLabel: letter,
      });
    }

    clearTimeout(this.cellTimeoutMap[letter]);
    Object.values(this.cellMap).forEach(el =>
      el.classList.remove('grid__cell--active')
    );

    const [start, duration] = LETTER_START_TIMES[letter];
    this.soundManager.start(start, duration);

    this.cellMap[letter].classList.add('grid__cell--active');
    this.cellTimeoutMap[letter] = setTimeout(() => {
      this.cellMap[letter].classList.remove('grid__cell--active');
    }, duration);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.title = 'The MBMBAlphabet - Loading...';
  App.createAndLoad().then(() => (document.title = 'The MBMBAlphabet'));
});
