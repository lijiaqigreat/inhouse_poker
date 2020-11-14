import xor128 from 'seedrandom/lib/xor128';
// const xor128 = function(){this.next=() => 1}

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

const cards = []
for(let t = 0;t<52;t++){
  const rank = ranks[(t/4)|0];
  const suite = suites[t%4];
  cards.push({ rank, suite, abbr: rank.abbr + suite.abbr, text: `${suite.ascii}${rank.text}` });
}
  // TICK_COMMAND: 1,
  // ID_COMMAND: 2,
  // WRITER_COMMAND: 3
const STATES = {
  PRE_FLOP: 1,
  FLOP: 2,
  TURN: 3,
  RIVER: 4,
}
const N_CARDS = {
  [STATES.PRE_FLOP]: 0,
  [STATES.FLOP]: 3,
  [STATES.TURN]: 4,
  [STATES.RIVER]: 5,
}

const COMMAND_TYPES = {
  JOIN: 0,
  LEAVE: 1,
  SET_STATE: 2,
  RESET: 3,
}
const SEED_LENGTH = 8

export class Game {
  constructor(client) {
    this.idToPosition = new Map()
    this.positionToId = new Map()
    this.state = STATES.PRE_FLOP;
    this.cards = cards
    this.secretRandom = xor128()
    this.client = client
    this.client.setCb(this.processCommands.bind(this))
    this.cb = undefined
  }
  sendBytes(arr) {
    this.client.send(new Uint8Array(arr))
  }

  getCommunityCards() {
    const nCards = N_CARDS[this.state]
    return this.cards.slice(0,nCards)
  }
  getMyPosition() {
    return this.idToPosition.get(this.client.id)
  }
  getMyCards() {
    const p = this.getMyPosition()
    if(p == undefined) {
      return []
    }
    const index = 5+p*2
    return [this.cards[index], this.cards[index+1]]
  }

  processCommands(cs) {
    cs.forEach(c => {
      if(c.writerCommand) {
        const wc = c.writerCommand
        const id = wc.id
        const command = wc.command
        switch(command[0]) {
          case COMMAND_TYPES.JOIN:
            if(this.idToPosition.has(id)){
            } else {
              for(let p = 0;p < 22; p++) {
                if(!this.positionToId.has(p)) {
                  this.positionToId.set(p, id);
                  this.idToPosition.set(id, p);
                  break
                }
              }
              debugger
            }
            break
          case COMMAND_TYPES.LEAVE:
            if(this.idToPosition.has(id)){
              const p = this.idToPosition.get(id)
              this.positionToId.delete(p);
              this.idToPosition.delete(id);
            }
            break
          case COMMAND_TYPES.SET_STATE:
            const state = command[1];
            if((state > 0) && (state < 5)){
              this.state = state
            }
            break
          case COMMAND_TYPES.RESET:
            this.state = STATES.PRE_FLOP
            this.cards = cards.slice()
            let seed = ""
            for(let t = 0;t < SEED_LENGTH; t++){
              seed += String.fromCharCode(command[t+1])
            }
            const rd = new xor128(seed)
            for(let t = 0;t<51;t++) {
              const p = ((rd.int32()/Math.pow(2,32) + 0.5)*(52-t))|0
              const swap = this.cards[p+t]
              this.cards[p+t]=this.cards[t]
              this.cards[t] = swap
            }
            break
        }
      }
    })
    if(this.cb) {
      this.cb(this)
    }
  }
}
