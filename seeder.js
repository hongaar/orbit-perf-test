const faker = require("faker")
const buildTransform = require("@orbit/data/dist/commonjs/es5/transform").buildTransform

const usersPerGroup = 100
const childrenPerParent = 2

const seeder = (options) => {
  const {n = 100, parents = true, groups = true} = options

  // Initialize results array
  const operations = []

  // Initialize counters etc.
  let userIdCounter = 1
  let groupIdCounter = 1
  let recordsLeft = n
  let currentGroup
  let currentUsersForGroup = 0
  let currentParent
  let currentChildrenForParent = 0

  // Main loop
  while (recordsLeft > 0) {

    const relationships = {}

    // Should we be creating groups?
    if (groups) {

      // When current group has max. amount of users, unset
      if (currentUsersForGroup >= usersPerGroup) {
        currentGroup = undefined
        currentUsersForGroup = 0
      }

      // When no group exists, create a new one
      if (!currentGroup) {
        currentGroup = createGroup(groupIdCounter++)
        operations.push(createOperation(currentGroup))
        recordsLeft--
      }

      // Add group to relationships object
      relationships.group = {
        data: {type: "group", id: currentGroup.id},
      }

      // Increment counter
      currentUsersForGroup++
    }

    // Should we be creating parents?
    if (parents) {

      // When current parent has max. amount of children, unset
      if (currentChildrenForParent >= childrenPerParent) {
        currentParent = undefined
        currentChildrenForParent = 0
      }

      // When no parent exists, create a new one
      if (!currentParent) {
        currentParent = createUser(userIdCounter++)
        operations.push(createOperation(currentParent))
        recordsLeft--
      }

      // Add parent to relationships object
      relationships.parent = {
        data: {type: "user", id: currentParent.id},
      }

      // Increment counter
      currentChildrenForParent++

    }

    // Create record
    operations.push(createOperation(createUser(userIdCounter++, relationships)))
    recordsLeft--

  }

  return createTransform(operations)
}

const createTransform = (operations) => buildTransform(operations)

const createOperation = (record) => ({
  op: "addRecord",
  record,
})

const createGroup = (id) => {
  return {
    type: "group",
    id,
    attributes: {
      name: faker.name.jobArea(),
    },
    relationships: {
      users: [],
    },
  }
}

const createUser = (id, relationships = {}) => {
  return {
    type: "user",
    id,
    attributes: {
      name: faker.name.findName(),
    },
    relationships: Object.assign({}, {
      children: [],
    }, relationships),
  }
}

module.exports = seeder