const express = require('express');
const crypto = require('crypto');
const cardDealer = require('card-dealer');
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

const tmp = [
  (game) => {
    const cards = _.map(cardDealer.shuffle(), (card) => {
      return JSON.stringify(card);
    });
    game.cards = cards;
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
  res.render('card', {user: users[key]});
});

router.get('/community', (req, res, next) => {
  const state = req.query.state;
  const i1 = _.indexOf(STATES, state);
  const i2 = _.indexOf(STATES, publicGame.state);
  if(i1==i2){
  }else if(i1==i2+1){
    tmp[i1](game);
  }else if(state == 'initial'){
    tmp[0](game);
  }else if(state == 'preflop'){
    tmp[0](game);
    tmp[1](game);
  }
  res.render('community', {publicGame, debug: JSON.stringify(game)});
});

module.exports = router;
