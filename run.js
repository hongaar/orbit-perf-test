const {execSync} = require("child_process")

// Full test suite

// Relationship variations
const variations = [
  {parents: false, groups: false},
  {parents: false, groups: true},
  {parents: true, groups: false},
  {parents: true, groups: true},
]

// n variations
const ns = [
  // 10, 100,
  10, 100, 1000, 10000, 100000,
  // 10, 100, 1000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000
]

// Iterations
const iterations = 5

console.log(`iterations=${iterations}`)

// Go!
variations.forEach((variation) => {
  console.log(`parents=${variation.parents ? 1 : 0} groups=${variation.groups ? 1 : 0}`)

  const result = []

  // n variations
  ns.forEach((n) => {
    process.stdout.write(`n=${n}\t\t`)

    const runs = []
    const command = `node auto.js ${n} ${variation.parents ? 1 : 0} ${variation.groups ? 1 : 0}`

    for (let i = 0; i < iterations; i++) {
      process.stdout.write(".")
      runs.push(parseFloat(execSync(command, {encoding: "utf8"})))
    }
    process.stdout.write("\n")

    // Add average to result array
    result.push(runs.reduce((a, b) => a + b) / runs.length)

  })

  process.stdout.write("\n")
  console.log(result.join("\n"))
  process.stdout.write("\n")

})