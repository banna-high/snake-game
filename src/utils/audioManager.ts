class AudioManager {
  private static instance: AudioManager;
  private bgm: HTMLAudioElement;
  private sounds: { [key: string]: HTMLAudioElement };
  private isMuted: boolean = false;

  private constructor() {
    // 创建音频上下文
    this.createAudioElements();
  }

  private createAudioElements() {
    // 创建背景音乐
    this.bgm = document.createElement('audio');
    this.bgm.src = 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3';
    this.bgm.loop = true;
    this.bgm.volume = 0.2;

    // 创建音效
    this.sounds = {
      eat: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3', 0.3),
      gameOver: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-retro-arcade-game-over-470.mp3', 0.4),
      powerUp: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-arcade-mechanical-bling-210.mp3', 0.35),
      move: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-arcade-mechanical-bling-210.mp3', 0.1),
      boost: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-fast-small-sweep-transition-166.mp3', 0.25),
    };

    // 添加到文档中以确保加载
    document.body.appendChild(this.bgm);
    Object.values(this.sounds).forEach(sound => {
      document.body.appendChild(sound);
    });
  }

  private createSound(src: string, volume: number): HTMLAudioElement {
    const sound = document.createElement('audio');
    sound.src = src;
    sound.volume = volume;
    return sound;
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public playBGM() {
    if (!this.isMuted) {
      // 用户交互后播放背景音乐
      const playPromise = this.bgm.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('BGM playback prevented by browser', error);
        });
      }
    }
  }

  public stopBGM() {
    this.bgm.pause();
    this.bgm.currentTime = 0;
  }

  public playSound(soundName: string) {
    if (!this.isMuted && this.sounds[soundName]) {
      const sound = this.sounds[soundName];
      
      // 重置音频并播放
      sound.currentTime = 0;
      const playPromise = sound.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log(`Sound ${soundName} playback prevented by browser`, error);
        });
      }
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    this.bgm.muted = this.isMuted;
    Object.values(this.sounds).forEach(sound => {
      sound.muted = this.isMuted;
    });
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  // 清理函数
  public cleanup() {
    this.stopBGM();
    document.body.removeChild(this.bgm);
    Object.values(this.sounds).forEach(sound => {
      document.body.removeChild(sound);
    });
  }
}

export default AudioManager; 