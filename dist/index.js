/******/ (() => { // webpackBootstrap

function getQuery(id) {
  const input = document.getElementById(id)
  return encodeURIComponent(input.value)
}

function redirectWithRoomAndName(page) {

  window.location.href = `${page}.html?room=${getQuery("room")}&name=${getQuery("name")}`
}

const hand = document.getElementById("hand")
const community = document.getElementById("community")
hand.onclick = () => {
  redirectWithRoomAndName("hand")
}

community.onclick = () => {
  redirectWithRoomAndName("community")
}

/******/ })()
;