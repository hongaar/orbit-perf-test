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

const askForSync = () => {
  // Get user input
  console.log("Run now? Press enter.")
  process.stdin.resume()
}

// Sync to store
const doSync = () => {
  // debugger
  console.log("Hold tight!")
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
    .then(() => {
      // Tests
      const users1 = store.cache.query(q => q.findRelatedRecords({type: "group", id: 1}, "users"))
      const users2 = store.cache.query(q => q.findRecord({type: "group", id: 1})).relationships.users.data
      if (users1.length !== 6 || users2.length !== 6) {
        console.error("Group should have 6 users, not " + users1.length + '/' + users2.length)
      } else {
        console.log("Group has 6 users")
      }

      const children1 = store.cache.query(q => q.findRelatedRecords({type: "user", id: 1}, "children"))
      const children2 = store.cache.query(q => q.findRecord({type: "user", id: 1})).relationships.children.data
      if (children1.length !== 2 || children2.length !== 2) {
        console.error("User should have 2 children, not " + children1.length + '/' + children2.length)
      } else {
        console.log("User has 2 children")
      }
    })
    .catch((e) => {
      console.error(e)
    })
    .then(askForSync)
}

// When we want to run again
process.stdin.on("data", function(chunk) {
  if (chunk !== null) {
    process.stdin.pause()
    doSync()
  }
})

askForSync()