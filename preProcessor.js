const addToRelatedModels = (relationships, name, identifier) => {
  if (!relationships[name]) {
    relationships[name] = {data: []}
  }

  relationships[name].data.push(identifier)
}

const preProcessor = (transform) => {
  // Create indexes
  const index = {
    group: {},
    user: {},
  }

  transform.operations.forEach((operation) => {
    // Add to index
    index[operation.record.type][operation.record.id] = operation.record

    // Add reverse relationship
    if (operation.record.type === "user") {

      // Add user to group
      if (operation.record.relationships.group) {
        addToRelatedModels(index["group"][operation.record.relationships.group.data.id].relationships, "users", {
          type: "user",
          id: operation.record.id,
        })
      }

      // Add child to parent
      if (operation.record.relationships.parent) {
        addToRelatedModels(index["user"][operation.record.relationships.parent.data.id].relationships, "children", {
          type: "user",
          id: operation.record.id,
        })
      }
    }
  })

  return transform
}

module.exports = preProcessor