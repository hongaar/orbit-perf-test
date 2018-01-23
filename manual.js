const storeCreator = require("./store")
const seeder = require("./seeder")
const preProcessor = require("./preProcessor")
const diffTimeInMs = require("./diffTimeInMs")
const {Map} = require("immutable")

const options = {
  n: process.argv[2] || 100,
  parents: typeof process.argv[3] !== "undefined" ? !!parseFloat(process.argv[3]) : true,
  groups: typeof process.argv[4] !== "undefined" ? !!parseFloat(process.argv[4]) : true,
  preProcess: typeof process.argv[5] !== "undefined" ? !!parseFloat(process.argv[5]) : false,
  testImmutable: false,
}
console.log("Using options:", options)

let start
let duration

// Create transform
start = process.hrtime()
const transform = seeder(options)
duration = diffTimeInMs(start)
console.log(`Creating ${options.n} records took ${duration}ms`)

// Pre-process records
if (options.preProcess) {
  start = process.hrtime()
  preProcessor(transform)
  duration = diffTimeInMs(start)
  console.log(`Pre-processing ${options.n} records took ${duration}ms`)
}

// Optionally view the transform
// console.log(JSON.stringify(transform, null, 2))

// For comparison, test immutable.js
if (options.testImmutable) {
  start = process.hrtime()
  const records = transform.operations.map((operation) => operation.record)
  const indexed = {
    user: {},
    group: {},
  }
  records.forEach((record) => indexed[record.type][record.id] = record)
  // console.log(JSON.stringify(indexed, null, 2))
  const indexedCollection = {
    user: {},
    group: {},
  }
  Object.keys(indexed).forEach((key) => {
    indexedCollection[key] = Map(indexed[key])
    // console.log(JSON.stringify(indexedCollection[key].toJSON(), null, 2))
  })
  duration = diffTimeInMs(start)
  console.log(`Immutable.js hydrate took ${duration}ms`)
}

// Sync to store
const doSync = () => {
  start = process.hrtime()
  const store = storeCreator()
  store
    .sync(transform)
    .then(() => {
      duration = diffTimeInMs(start)
      console.log(`Syncing ${options.n} records took ${duration}ms`)
      console.log(`That is ${Math.round(options.n * 1000 / duration)} records/s`)
      console.log(`Or ${duration / options.n}s/1000 records`)
    })
    .catch((e) => {
      console.error(e)
    })
    .then(() => {
      // Get user input
      console.log("Run again? Press enter.")
      process.stdin.resume()
    })
}

// When we want to run again
process.stdin.on('data', function(chunk) {
  if (chunk !== null) {
    process.stdin.pause()
    doSync()
  }
})

doSync()

// console.log(JSON.stringify(transform, null, 2))