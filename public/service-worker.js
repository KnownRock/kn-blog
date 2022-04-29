self.addEventListener('fetch', function(event) {
  return fetch(event.request)
})