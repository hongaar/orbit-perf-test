const store = require("./store")
const seeder = require("./seeder")
const diffTimeInMs = require("./diffTimeInMs")

const options = {
  n: process.argv[2],
  parents: !!parseFloat(process.argv[3]),
  groups: !!parseFloat(process.argv[4]),
}

let start
let duration

// Create transform
const transform = seeder(options)

// Sync to store
start = process.hrtime()
store
  .sync(transform)
  .then(() => {
    duration = diffTimeInMs(start)
    console.log(duration)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })