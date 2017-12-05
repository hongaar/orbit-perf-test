orbit performance test
======================

test case with following schema:

```js
const schema = {
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
```

test scripts test scenario where only one relationship is defined in the input records (parent, group), and the inverse (children, users) is left to orbit to process.

to run set of tests with varying n (between 10 - 100000) with 4 relationship scenarios and 5 iterations per test:

```
node run.js
```

or manual run:

```
node manual.js [n:int=100] [parent-relationship:bool=1] [group-relationship:bool=1]
```

variations
----------

- modify `run.js` to use different n's and/or relationship scenarios.
- modify `run.js` to use different iteration count.
- modify `store.js` to use schema without inverse relationships.
- modify `store.js` to use a different set of cache processors.