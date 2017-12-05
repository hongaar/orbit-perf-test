const diffTimeInMs = (start) => {
  const diff = process.hrtime(start)
  return (diff[0] * 1000 + diff[1] / 1000000)
}

module.exports = diffTimeInMs