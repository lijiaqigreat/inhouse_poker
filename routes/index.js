const express = require('express');
const crypto = require('crypto');
const shuffle = require('array-shuffle');
const _ = require('underscore');
const router = express.Router();
const COOKIES_KEY = 'key';
const STATES = [
  'intial',
  'preflop',
  'flop',
  'turn',
  'river',
];
const publicGame = {
  cards: [],
  state: 'initial',
};
const users = {};
const game = {
  cards: [],
  publicGame: publicGame,
  users: users,
}
const suites = [
  { id: 0, ascii: "♠", color: "#000000", abbr: "C", text: "Clubs" },
  { id: 1, ascii: "♦", color: "#00FF00", abbr: "D", text: "Diamonds" },
  { id: 2, ascii: "♥", color: "#FF0000", abbr: "H", text: "Hearts" },
  { id: 3, ascii: "♣", color: "#0000FF", abbr: "S", text: "Spades" },
];
const ranks = [
  { id: 0, abbr: "2", text: "2" },
  { id: 1, abbr: "3", text: "3" },
  { id: 2, abbr: "4", text: "4" },
  { id: 3, abbr: "5", text: "5" },
  { id: 4, abbr: "6", text: "6" },
  { id: 5, abbr: "7", text: "7" },
  { id: 6, abbr: "8", text: "8" },
  { id: 7, abbr: "9", text: "9" },
  { id: 8, abbr: "T", text: "10" },
  { id: 9, abbr: "J", text: "Jack" },
  { id: 10, abbr: "Q", text: "Queen" },
  { id: 11, abbr: "K", text: "King" },
  { id: 12, abbr: "A", text: "Ace" },
];
const cards = _.map(new Array(52), (x, i) => {
  const rank = ranks[(i/4)|0];
  const suite = suites[i%4];

  return { rank, suite, abbr: rank.abbr + suite.abbr, text: `${suite.ascii}${rank.text}` };
});

const tmp = [
  (game) => {
    game.cards = shuffle(cards);
    game.publicGame.cards = [];
    game.publicGame.state = 'initial';
    _.each(game.users, (user) => {
      user.cards = [];
    });
  },
  (game) => {
    const cards = game.cards;
    _.each(game.users, (user) => {
      user.cards = [cards.pop(), cards.pop()];
    });
    game.publicGame.state = "preflop";
  },
  (game) => {
    const cards = game.cards;
    game.publicGame.cards = [cards.pop(), cards.pop(), cards.pop()];
    game.publicGame.state = "flop";
  },
  (game) => {
    const cards = game.cards;
    game.publicGame.cards.push(cards.pop());
    game.publicGame.state = "turn";
  },
  (game) => {
    const cards = game.cards;
    game.publicGame.cards.push(cards.pop());
    game.publicGame.state = "river";
  },
]

/* GET home page. */
router.get('/', (req, res, next) => {
  const key = req.cookies[COOKIES_KEY];
  console.log('GET "/" users: ',JSON.stringify(users));
  res.render('index', { title: 'Express' });
});
router.post('/',(req, res, next) => {
  const name = req.body.name;
  var key = req.cookies[COOKIES_KEY];
  if(!key){
    key = crypto.randomBytes(16).toString('base64');
    res.cookie(COOKIES_KEY, key);
  }
  const user = {
    name: name,
    cards: [],
  };
  users[key] = user;

  res.redirect('/card');
});
router.get('/leave', (req, res, next) => {
  console.log('GET /leave');
  const key = req.cookies[COOKIES_KEY];
  if(key){
    res.clearCookie(COOKIES_KEY);
    delete users[key];
  }
  res.redirect('/');
});

router.get('/card', (req, res, next) => {
  const key = req.cookies[COOKIES_KEY];
  if(users[key]){
    res.render('card', {user: users[key]});
  }else{
    res.redirect('/');
  }
});

router.get('/community', (req, res, next) => {
  const state = req.query.state;
  const i1 = _.indexOf(STATES, state);
  const i2 = _.indexOf(STATES, publicGame.state);
  if(state == 'preflop'){
    tmp[0](game);
    tmp[1](game);
  }else if(i1==i2){
  }else if(i1==i2+1){
    tmp[i1](game);
  }else if(state == 'initial'){
    tmp[0](game);
  }
  res.render('community', {publicGame, debug: JSON.stringify(game)});
});

module.exports = router;
