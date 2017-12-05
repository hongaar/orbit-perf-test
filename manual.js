const store = require("./store")
const seeder = require("./seeder")
const preProcessor = require("./preProcessor")
const diffTimeInMs = require("./diffTimeInMs")

const options = {
  n: process.argv[2] || 100,
  parents: typeof process.argv[3] !== "undefined" ? !!parseFloat(process.argv[3]) : true,
  groups: typeof process.argv[4] !== "undefined" ? !!parseFloat(process.argv[4]) : true,
  preProcess: typeof process.argv[5] !== "undefined" ? !!parseFloat(process.argv[5]) : false,
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

// Sync to store
start = process.hrtime()
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

// console.log(JSON.stringify(transform, null, 2))