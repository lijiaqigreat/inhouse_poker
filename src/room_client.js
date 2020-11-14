import {rootPromise} from "./proto.js";


class RoomClient {
  constructor(ws, id, Commands) {
    this.ws = ws;
    this.id = id;
    this.cb = undefined;
    this.commands = [];
    ws.addEventListener("message", (event) => {
      event.data.arrayBuffer().then(buffer => {
        const cs = Commands.decode(new Uint8Array(buffer)).commands
        if(this.cb) {
          this.cb(cs)
        } else {
          this.commands.push(...cs)
        }
      })
    });
  }
  setCb(cb) {
    cb(this.commands)
    this.cb = cb
  }
  send(bytes) {
    this.ws.send(bytes)
  }
}

export async function createClient(room, id, index) {
  const ws = new WebSocket(`wss://forrest.pw/ws?room_id=${room}&id=${id}&index=${index}`)
  const root = await rootPromise;
  const Commands = root.lookup('tmp.Commands')
  return new Promise((done, error) => {
    ws.addEventListener("open", () => {
      done(new RoomClient(ws, id, Commands))
    })
    ws.addEventListener("error", (message) => {
      error(message)
    })
  })
}
