# Cyrillic Alphabet Learning Game with Audio

A fun, interactive web game to learn the Russian Cyrillic alphabet with authentic pronunciation audio!

## Features
- **Learn Mode**: Browse through all 33 Cyrillic letters with pronunciations and **audio playback**
- **Quiz Mode**: Test your knowledge with randomized multiple-choice questions and **hear the sounds**
- **Progress Tracking**: See your score and percentage correct
- **Audio Support**: Native speaker pronunciation for every letter
- **Responsive Design**: Works on desktop, tablet, and mobile

## Audio Files
The `audio/` folder contains 33 MP3 files (01.mp3 through 33.mp3) with native Russian pronunciation of each Cyrillic letter in alphabetical order:
- 01.mp3 = А (ah)
- 02.mp3 = Б (beh)
- 03.mp3 = В (veh)
- ...and so on

## How to Use Locally
1. Open `index.html` in any modern web browser
2. Start learning the alphabet in Learn mode - **click "Play Sound"** to hear each letter
3. Take the quiz when you're ready - **click "Hear Sound"** during questions to help identify letters

## How to Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and sign up for free
2. Drag the entire folder (including the `audio/` subfolder) onto Netlify's deploy area
3. Your game will be live with a URL like `yoursite.netlify.app`

## File Structure
```
cyril/
├── index.html          # Main HTML file with all dependencies
├── script.js           # React component with game logic and audio
├── README.md           # This documentation file
└── audio/              # Audio pronunciation files
    ├── 01.mp3          # А pronunciation
    ├── 02.mp3          # Б pronunciation
    ├── ...             # (33 total audio files)
    └── 33.mp3          # Я pronunciation
```

## Technologies Used
- React 18
- Tailwind CSS for styling
- HTML5 Audio API for sound playback
- Lucide React for icons (replaced with emoji)
- Vanilla JavaScript for game logic

## Game Modes
1. **Learn Mode**: Study each letter with its Latin equivalent, pronunciation guide, and **audio playback**
2. **Quiz Mode**: 10 random questions testing your knowledge with **optional audio hints**
3. **Results**: See your final score and performance feedback

## Audio Requirements
- Modern browser with HTML5 audio support
- Audio files must be in the `audio/` folder relative to `index.html`
- MP3 format supported in all modern browsers

Enjoy learning Russian with authentic pronunciation! 🇷🇺🔊