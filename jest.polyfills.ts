const { TextEncoder: TE, TextDecoder: TD } = require('util')
const { TransformStream: TS, ReadableStream: RS, WritableStream: WS } = require('stream/web')
const { BroadcastChannel: BC } = require('worker_threads')

Object.assign(global, { 
    TextEncoder: TE, 
    TextDecoder: TD, 
    TransformStream: TS, 
    ReadableStream: RS, 
    WritableStream: WS, 
    BroadcastChannel: BC 
})