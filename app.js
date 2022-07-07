const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8 PLAYER';

const heading = $('header h2');
const cdthumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const player = $('.player');
const progress = $('#progress');
const prevBtn = $('.btn-prev');
const nextBtn = $('.btn-next');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

/**
 * 1. Render Songs 
 * 2. Scroll Behavior (Hide and change opacity of CD Thumbnail as Scrolling Down)
 * 3. Play / Pause / Seek 
 * 4. CD thumb rotate animation
 * 5. Next / Prev 
 * 6. Random
 * 7. Next / Repeat when ended
 * 8. Active Song
 * 9. Scroll Active Song Into View
 * 10. Play song when click
 */


const app = {
  currentIndex: 0,
  isPlaying: false,
  isRandom: false,
  isRepeat: false,
  config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
  setConfig: function(key, value){
    this.config[key] = value
    localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
  },
  songs: [
      {
        name: "Myself",
        singer: "Post Malone",
        path: "https://legitmuzic.com/wp-content/uploads/2022/04/Post_Malone_-_Myself_legitmuzic.com.mp3?_=3",
        image: "https://avatar-ex-swe.nixcdn.com/song/2019/09/06/4/4/6/f/1567746037163_640.jpg"
      },
      {
        name: "Glimpse Of Us",
        singer: "Joji",
        path: "https://data.chiasenhac.com/down2/2253/2/2252008-ffba4b98/128/Glimpse%20Of%20Us%20-%20Joji.mp3",
        image:
          "https://images.genius.com/ee17f873c76c455455e879e3def486f8.1000x1000x1.jpg"
      },
      {
        name: "Chạy Khỏi Thế Giới Này",
        singer: "Da LAB; Phương Ly",
        path:
          "https://data.chiasenhac.com/down2/2261/3/2260353-72ec4108/128/Chay%20Khoi%20The%20Gioi%20Nay%20-%20Da%20LAB_%20Phuong.mp3",
        image: "https://data.chiasenhac.com/data/cover/169/168211.jpg"
      },
      {
        name: "Save Your Tears (Remix)",
        singer: "The Weeknd; Ariana Grande",
        path:
          "https://data.chiasenhac.com/down2/2167/2/2166494-45d9eb7d/128/Save%20Your%20Tears%20Remix_%20-%20The%20Weeknd_%20Ari.mp3",
        image: "https://data.chiasenhac.com/data/cover/140/139217.jpg"
      },
      {
        name: "Goodbyes",
        singer: "Post Malone; Young Thug",
        path:
          "https://data.chiasenhac.com/down2/2224/2/2223719-390d2662/128/Goodbyes%20-%20Post%20Malone_%20Young%20Thug.mp3",
        image: "https://data.chiasenhac.com/data/cover/155/154961.jpg"
      }
   ],
  render: function() {
        const htmls = this.songs.map((song, index) => {
            return `<div class="song ${index == this.currentIndex ? 'active' : ''}" data-index = "${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>`
        })
        playlist.innerHTML = htmls.join('');
   },

  defineProperties: function() {
      Object.defineProperty(this, 'currentSong', {
          get: function() {
            return this.songs[this.currentIndex];
          }
      })
   },

  handleEvents: function() {
    const _this = this;
    const cdWidth = cd.offsetWidth;

    // CD spinnin' animation
    const cdthumbAnimate = cdthumb.animate([
      {transform: 'rotate(360deg)'}
    ], {
      duration: 10000,
      iterations: Infinity,
    });
    cdthumbAnimate.pause();


    document.onscroll = function() {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const newCdWidth = cdWidth - scrollTop;

        cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0 + 'px';
        cd.style.opacity = newCdWidth / cdWidth
      };
    
    // Cick Play Button
    playBtn.onclick = function(){
          if (_this.isPlaying){
            audio.pause();
          } else {
            audio.play();
          };
    };

    // SpaceBar = Play 
    document.addEventListener('keydown', (e) => {
      if (e.code === "Space" ) {
          e.preventDefault();
          playBtn.click();
      }
    });

    // Play next song when the previous song ended
    audio.onended = function(){
      if (_this.isRepeat) {
        audio.play();
      } else {
        nextBtn.click();
      }
    }

    //When the song is playing
    audio.onplay = function(){
      _this.isPlaying = true;
      player.classList.add('playing')
      cdthumbAnimate.play();
    };
    //When the song is paused
    audio.onpause = function(){
      _this.isPlaying = false;
      player.classList.remove('playing')
      cdthumbAnimate.pause();
    };
    // Time update 
    audio.ontimeupdate = function(){
      if(audio.duration){
        const progressPercent = Math.floor((audio.currentTime / audio.duration) * 100)
        progress.value = progressPercent;
      }
    }
    //Skip
    progress.onchange = function(e){
      const seekTime = (audio.duration/100 * e.target.value);
      if (app.isPlaying) {
          audio.currentTime = seekTime;
      } else {
          audio.play();
          audio.currentTime = seekTime;
      }
    };

    // Next Button 
    nextBtn.onclick = function(){
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.nextSong();
      }
      audio.play();
      _this.render();
      _this.scrollToActiveSong();
    }
    //Prev Button
    prevBtn.onclick = function(){
      if (_this.isRandom) {
        _this.playRandomSong();
      } else {
        _this.prevSong();
      };
      audio.play();
      _this.render();

    }

    //Random Button on click 
    randomBtn.onclick = function(){
      _this.isRandom = !_this.isRandom;
      _this.setConfig('isRandom', _this.isRandom);
      randomBtn.classList.toggle('active', _this.isRandom);
    }

    // Repeat Button
    repeatBtn.onclick = function(e){
      _this.isRepeat = !_this.isRepeat;
      _this.setConfig('isRepeat', _this.isRepeat)
      repeatBtn.classList.toggle('active', _this.isRepeat);
    }

    

    // Click on playlist to change song
    playlist.onclick = function(e){
      const songNode = e.target.closest('.song:not(.active)');
      if (songNode || e.target.closest('.option')){
          if(songNode) {
            _this.currentIndex = songNode.dataset.index
            _this.loadCurrentSong();
            audio.play();
            _this.render();
          }
      }
    }
  },

  loadCurrentSong: function() {
      heading.textContent = this.currentSong.name;
      cdthumb.style.backgroundImage = `url(\'${this.currentSong.image}')`
      audio.src = this.currentSong.path
  },

  loadConfig: function(){
    this.isRandom = this.config.isRandom;
    this.isRepeat = this.config.isRepeat
  },

  nextSong: function() {
      this.currentIndex++;
      if(this.currentIndex >= this.songs.length) {
        this.currentIndex = 0
      }
      this.loadCurrentSong();
  },
  prevSong: function() {
    this.currentIndex--;
    if(this.currentIndex < 0) {
      this.currentIndex = this.songs.length-1
    }
    this.loadCurrentSong();
  },
  playRandomSong: function(){
    let newIndex;
    do {
      newIndex = Math.floor(Math.random()*this.songs.length)
    }while (newIndex === this.currentIndex)
    this.currentIndex = newIndex;
    this.loadCurrentSong();
  },
  scrollToActiveSong: function(){
    setTimeout(()=>{
      $('.song.active').scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })  
    }, 200)
  },
  start: function() {
    //  Gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        this.defineProperties();
        
        this.loadCurrentSong();
        
        this.handleEvents();

        this.render();

        // Hiển thị trạng thái ban đầu của 2 nút RP và RD
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
  } 
}




app.start()
