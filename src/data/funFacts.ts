export const funFacts = [
  "🌟 Octopuses have three hearts and blue blood!",
  "🚀 A day on Venus is longer than its year!",
  "🧠 Your brain uses about 20% of your body's energy!",
  "🐝 Honey never spoils - archaeologists found 3000-year-old honey that's still edible!",
  "🌊 The ocean produces over 50% of the world's oxygen!",
  "⚡ Lightning strikes the Earth about 100 times every second!",
  "🦒 Giraffes only need 5 to 30 minutes of sleep per day!",
  "🌙 There's no sound in space because molecules are too far apart!",
  "🍌 Bananas are berries, but strawberries aren't!",
  "🐌 A snail can sleep for three years straight!",
  "💎 It rains diamonds on Jupiter and Saturn!",
  "🦈 Sharks have been around longer than trees!",
  "🌍 Earth is the only planet not named after a god!",
  "🐜 Ants never sleep and don't have lungs!",
  "🧊 Hot water can freeze faster than cold water!",
  "🦋 Butterflies can taste with their feet!",
  "🌈 You can't hum while holding your nose!",
  "🐘 Elephants are the only mammals that can't jump!",
  "🎵 Music can help plants grow faster!",
  "🧬 Humans share 60% of their DNA with bananas!",
];

export const getRandomFunFact = (): string => {
  return funFacts[Math.floor(Math.random() * funFacts.length)];
};
