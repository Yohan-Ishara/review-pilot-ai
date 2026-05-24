export const mockGoogleAccounts = [
  {
    google_account_id: 'accounts/mock-local-services',
    google_account_name: 'Mock Local Services Group',
  },
  {
    google_account_id: 'accounts/mock-agency-client',
    google_account_name: 'Mock Agency Client Account',
  },
]

export const mockGoogleLocations = [
  {
    google_location_id: 'locations/mock-downtown',
    google_location_name: 'Downtown Service Center',
    address: '123 Market Street',
  },
  {
    google_location_id: 'locations/mock-westside',
    google_location_name: 'Westside Branch',
    address: '42 Sunset Avenue',
  },
]

export const mockGoogleReviews = [
  {
    google_review_id: 'google-mock-review-1',
    reviewer_name: 'Google Customer',
    rating: 5,
    comment: 'Found them on Google and had a smooth, friendly experience from start to finish.',
    review_date: '2026-05-21T12:00:00Z',
    sentiment: 'positive',
    status: 'new',
  },
  {
    google_review_id: 'google-mock-review-2',
    reviewer_name: 'Maps Reviewer',
    rating: 2,
    comment: 'The service was okay, but I had trouble getting a clear update before my appointment.',
    review_date: '2026-05-20T15:30:00Z',
    sentiment: 'negative',
    status: 'new',
  },
]
