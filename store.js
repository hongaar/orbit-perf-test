const Schema = require("@orbit/data/dist/commonjs/es5/schema").default
const Store = require("@orbit/store/dist/commonjs/es5/store").default

const SCP = require("@orbit/store/dist/commonjs/es5/cache/operation-processors/schema-consistency-processor").default
const CIP = require("@orbit/store/dist/commonjs/es5/cache/operation-processors/cache-integrity-processor").default

const schemaDefinitionWithInverse = {
  models: {
    user: {
      attributes: {
        name: {type: "string"},
      },
      relationships: {
        parent: {type: "hasOne", model: "user", inverse: "children"},
        children: {type: "hasMany", model: "user", inverse: "parent"},
        group: {type: "hasOne", model: "group", inverse: "users"},
      },
    },
    group: {
      attributes: {
        name: {type: "string"},
      },
      relationships: {
        users: {type: "hasMany", model: "user", inverse: "group"},
      },
    },
  },
}

const schemaDefinitionWithoutInverse = {
  models: {
    user: {
      attributes: {
        name: {type: "string"},
      },
      relationships: {
        parent: {type: "hasOne", model: "user"},
        children: {type: "hasMany", model: "user"},
        group: {type: "hasOne", model: "group"},
      },
    },
    group: {
      attributes: {
        name: {type: "string"},
      },
      relationships: {
        users: {type: "hasMany", model: "user"},
      },
    },
  },
}

const storeCreator = () => {
  const schema = new Schema(schemaDefinitionWithInverse)
  // const schema = new Schema(schemaDefinitionWithoutInverse)

  return new Store({
    schema,
    cacheSettings: {
      processors: [SCP, CIP],
      // processors: [],
    },
  })
}


module.exports = storeCreator