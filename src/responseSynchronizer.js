const debounce = require('lodash.debounce')

let queuedResponses = []
const debouncedRespond = debounce(() => {
  console.log(`Responding with ${queuedResponses.length} items`)
  queuedResponses.forEach(queueItem => {
    queueItem.resolver(queueItem.callback())
  })
  queuedResponses = []
}, 400)

const responseSynchronizer = (callback) => function() {
  return new Promise(resolve => {
    let queueItem = {
      callback: () => callback(...arguments),
      resolver: resolve,
    }
    queuedResponses.push(queueItem);
    debouncedRespond();
  })
}

module.exports = responseSynchronizer
