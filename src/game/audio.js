export function playAudio(audioFile) {
  const audio = new Audio(`audio/${audioFile}`);
  audio.play().catch((e) => {
    console.log('Audio play failed:', e);
    // Fallback - could show a message to user
  });
}

export function preloadAudio(audioFiles) {
  return audioFiles.map((file) => {
    const audio = new Audio(`audio/${file}`);
    return { file, audio };
  });
}
