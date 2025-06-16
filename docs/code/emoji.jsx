// draw a row of emojis with various faces

const tags = [
  'grinning',
  'neutral_face',
  'confused',
  'scream',
  'joy',
  'heart_eyes',
];
const emojis = tags.map(t => new Emoji(t));
const row = new HStack(emojis, {
  spacing: 0.1,
});
return new Frame(row, {
  padding: 0.1,
});
