import pbjs from 'protobufjs'
export const rootPromise = pbjs.load('command.proto')
export const CommandPromise = rootPromise.then(root => root.lookup('tmp.Command'))




