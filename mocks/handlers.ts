import { http, HttpResponse } from 'msw'

export const handlers = [
  // Example handler - we will add specific ones as needed
  http.get('https://api.nfl.com/v1/games', () => {
    return HttpResponse.json([])
  }),
]
