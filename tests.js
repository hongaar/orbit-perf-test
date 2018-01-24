require("colors")

let tests = []
let store

const assertEquals = (actual, expected, message = "unnamed") => {
  if (expected !== actual) {
    console.error(`× Error while running test '${message}'.`.bgRed)
    console.error(`  - expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)} instead.`)
  } else {
    console.log(`✓ All good for test '${message}'`.green)
  }
}

const assertHasProperty = (object, property, message = "unnamed") => {
  assertEquals(object.hasOwnProperty(property), true, message)
}

const assertTrue = (condition, message = "unnamed") => {
  assertEquals(condition, true, message)
}

const assertLength = (object, length, message = "unnamed") => {
  if (!object.hasOwnProperty("length")) {
    assertEquals("no length property", "length property", message)
  } else {
    assertEquals(object.length, length, message)
  }
}

const test = (description, callback) => {
  tests.push(() => {
    console.log(`\nRunning ${description}...`)
    if (callback.length === 1) {
      return new Promise((accept, reject) => {
        callback(accept)
      })
    }

    callback()
    return Promise.resolve()
  })
}

// ============================================================================

test("Test group.relationships.users", () => {
  const users1 = store.cache.query(q => q.findRelatedRecords({type: "group", id: 1}, "users"))
  const users2 = store.cache.query(q => q.findRecord({type: "group", id: 1})).relationships.users.data
  assertLength(users1, 6, "Group has 6 users through findRelatedRecords")
  assertLength(users2, 6, "Group has 6 users through findRecord")
})
test("Test user.relationships.children", () => {
  const children1 = store.cache.query(q => q.findRelatedRecords({type: "user", id: 1}, "children"))
  const children2 = store.cache.query(q => q.findRecord({type: "user", id: 1})).relationships.children.data
  assertLength(children1, 2, "User has 2 children through findRelatedRecords")
  assertLength(children2, 2, "User has 2 children through findRecord")
})

test("Test adding a new record without initial relationship", (done) => {
  const record = {
    type: "user",
    id: "new1",
    attributes: {
      name: "new1",
    },
  }
  store.update(t => t.addRecord(record))
    .then(() => store.query(q => q.findRecord({type: "user", id: "new1"})))
    .then((record) => assertTrue(record.id === "new1", "New record is added"))
    .then((() => store.update(t => t.replaceRelatedRecord({type: "user", id: "new1"}, "group", {
      type: "group",
      id: 1,
    }))))
    .then(() => {
      const group1 = store.cache.query(q => q.findRelatedRecord({type: "user", id: "new1"}, "group"))
      const group2 = store.cache.query(q => q.findRecord({type: "user", id: "new1"})).relationships.group.data
      assertEquals(group1.id, 1, "New user should have group through findRelatedRecords")
      assertEquals(group2.id, 1, "New user should have group through findRecord")
      const users1 = store.cache.query(q => q.findRelatedRecords({type: "group", id: 1}, "users"))
      const users2 = store.cache.query(q => q.findRecord({type: "group", id: 1})).relationships.users.data
      assertLength(users1, 7, "Group has 7 children through findRelatedRecords")
      assertLength(users2, 7, "Group has 7 children through findRecord")
    })
    .then(done)
})
test("Test adding a new record with initial relationship", (done) => {
  const record = {
    type: "user",
    id: "new2",
    attributes: {
      name: "new2",
    },
    relationships: {
      group: {
        data: {
          type: "group",
        },
      },
    },
  }
  store.update(t => t.addRecord(record))
    .then(() => store.query(q => q.findRecord({type: "user", id: "new1"})))
    .then((record) => assertTrue(record.id === "new1", "New record is added"))
    .then((() => store.update(t => t.addToRelatedRecords({type: "group", id: "1"}, "users", {
      type: "user",
      id: "new1",
    }))))
    .then(() => {
      const users1 = store.cache.query(q => q.findRelatedRecords({type: "group", id: 1}, "users"))
      const users2 = store.cache.query(q => q.findRecord({type: "group", id: 1})).relationships.users.data
      assertLength(users1, 7, "Group has 7 children through findRelatedRecords")
      assertLength(users2, 7, "Group has 7 children through findRecord")
    })
    .then(done)
})

// ============================================================================

const testRunner = (arg1) => {
  store = arg1
  
  return tests.reduce((chain, fn) => chain.then(fn), Promise.resolve())
}

module.exports = testRunner