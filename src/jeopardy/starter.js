import { newBoard } from './model.js';
// Optional starting material. Never inserted into a user's library without a click.
export function starterBoard() {
  const board = newBoard();
  board.title = 'A little bit of everything';
  board.description = 'Five categories, 25 excuses to get competitive. Edit it and make it yours.';
  const content = [
    ['Around the world', ['This city is home to the Eiffel Tower.', 'Paris'], ['This country has the cities Kyoto and Osaka.', 'Japan'], ['This ocean lies between Africa and Australia.', 'The Indian Ocean'], ['This mountain range runs along the west of South America.', 'The Andes'], ['This country completely surrounds the nation of Lesotho.', 'South Africa']],
    ['Science-ish', ['This planet is known as the Red Planet.', 'Mars'], ['Plants absorb this gas from the atmosphere for photosynthesis.', 'Carbon dioxide'], ['This element has the chemical symbol Au.', 'Gold'], ['This force keeps planets in orbit around the Sun.', 'Gravity'], ['This part of a cell contains most of its genetic material.', 'The nucleus']],
    ['On the screen', ['This cowboy toy is Buzz Lightyear’s best friend.', 'Woody'], ['This fictional school is attended by Harry Potter.', 'Hogwarts'], ['This 2001 animated film features an ogre and a talking donkey.', 'Shrek'], ['This movie’s characters enter dreams within dreams.', 'Inception'], ['In The Matrix, Neo takes this color pill to learn the truth.', 'Red']],
    ['Food for thought', ['Guacamole is primarily made from this fruit.', 'Avocado'], ['This grain is traditionally used to make risotto.', 'Rice'], ['This spice gives many curries a bright yellow color.', 'Turmeric'], ['This Japanese term refers to the savory fifth basic taste.', 'Umami'], ['This legume is the main ingredient in traditional hummus.', 'Chickpeas']],
    ['Play by the rules', ['A standard soccer team starts with this many players on the field.', '11'], ['This chess piece moves in an L shape.', 'The knight'], ['In tennis, this word means a score of zero.', 'Love'], ['A standard deck of cards without jokers contains this many cards.', '52'], ['In volleyball, a team can normally touch the ball this many times before returning it, excluding a block.', '3']],
  ];
  board.categories = board.categories.map((category, i) => ({ ...category, name: content[i][0],
    clues: category.clues.map((clue, j) => ({ ...clue, question: content[i][j + 1][0], answer: content[i][j + 1][1] })) }));
  return board;
}
