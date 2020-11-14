import {createClient} from "./room_client.js"
import {Game} from "./game.js"

// import {Commands} from "./command_pb.ts";
// import tmp1 from "./proto.js"
import x from './test.svg'
import y from './command.proto'
import pbjs from 'protobufjs'
window.pbjs = pbjs
// window.tmp1 = tmp1
window.y = y

function getQuery(id) {
  const input = document.getElementById(id)
  return encodeURIComponent(input.value)
}

function redirectWithRoomAndName(page) {

  window.location.href = `${page}.html?room=${getQuery("room")}&name=${getQuery("name")}`
}


function syncQueryToInput(url, query, input) {
  input.value = url.searchParams.get(query)
}

const currentUrl = new URL(window.location.href)
const page = currentUrl.pathname.indexOf("/hand") === 0 ? "hand" : "community"


function getSocket(cb) {
  const room = document.getElementById("room")
  const name = document.getElementById("name")
  syncQueryToInput(currentUrl, "room", room)
  syncQueryToInput(currentUrl, "name", name)
  const connect = document.getElementById("connect")
  return new Promise(done => {
    connect.onclick = () => {
      createClient(room.value, name.value, 0)
        .then(done)
        .catch((a) => {
          console.error(a)
        })
    }
  })
}
getSocket().then(client => {
  const game = new Game(client);
  game.cb = (game) => {
    const imgs = document.getElementsByClassName("card")
    const cards = page === "hand" ? game.getMyCards() : game.getCommunityCards()
    for(let t = 0;t<cards.length;t++){
      imgs[t].src = `/images/${cards[t].abbr}.svg`;
    }
    for(let t = cards.length;t<imgs.length;t++){
      imgs[t].src = "/"
    }
  }
  window.game = game;
})

