import type { EventWithCreator } from "@/lib/supabase/types"

const mockLocations = [
  { id: "1", name: "Warsaw Drift Track", latitude: 52.2297, longitude: 21.0122, created_at: "" },
  { id: "2", name: "Krakow Racing Circuit", latitude: 50.0647, longitude: 19.945, created_at: "" },
  { id: "3", name: "Gdansk Motorsport Arena", latitude: 54.3520, longitude: 18.6466, created_at: "" },
  { id: "4", name: "Wroclaw Speed Park", latitude: 51.1079, longitude: 17.0385, created_at: "" },
  { id: "5", name: "Poznan Racing Complex", latitude: 52.4064, longitude: 16.9252, created_at: "" },
  { id: "6", name: "Katowice Drift Zone", latitude: 50.2649, longitude: 19.0238, created_at: "" },
]

const mockEventTitles = [
  "Warsaw Drift Championship",
  "Beginner Drift Workshop",
  "Street Drift Meetup",
  "Professional Drift Competition",
  "Night Drift Session",
  "Drift Training Camp",
  "Amateur Drift Contest",
  "Drift Skills Challenge",
  "Weekend Drift Practice",
  "Advanced Drift Techniques",
  "Drift Car Show & Competition",
  "Rookie Drift Experience",
  "Sunset Drift Session",
  "Winter Drift Challenge",
  "Spring Drift Festival",
  "Summer Drift Series",
  "Autumn Drift Cup",
  "Urban Drift Experience",
  "Mountain Drift Adventure",
  "Coastal Drift Rally",
]

const mockDescriptions = [
  "Join us for an exciting drift competition featuring drivers from across the region.",
  "Perfect for beginners looking to learn the basics of drifting in a safe environment.",
  "Casual meetup for drift enthusiasts to practice and share techniques.",
  "High-level competition featuring professional drift drivers and modified cars.",
  "Experience the thrill of night drifting under the lights.",
  "Intensive training camp to improve your drifting skills.",
  "Amateur-friendly competition with prizes for top performers.",
  "Test your skills in various drift challenges and obstacles.",
  "Relaxed practice session for all skill levels.",
  "Advanced techniques workshop for experienced drifters.",
  "Combine car show with competitive drifting action.",
  "First-time drift experience with professional instruction.",
  "Beautiful sunset backdrop for your drifting experience.",
  "Special winter conditions drift training and competition.",
  "Celebrate spring with our biggest drift festival of the year.",
  "Multi-round summer championship series.",
  "Autumn colors provide the perfect backdrop for drifting.",
  "City-based drift experience in urban environments.",
  "Take your drifting to scenic mountain locations.",
  "Drift by the coast with ocean views.",
]

const mockCreators = [
  { id: "1", display_name: "Alex Kowalski", email: "alex@example.com" },
  { id: "2", display_name: "Maria Nowak", email: "maria@example.com" },
  { id: "3", display_name: "Piotr Wiśniewski", email: "piotr@example.com" },
  { id: "4", display_name: "Anna Wójcik", email: "anna@example.com" },
  { id: "5", display_name: "Tomasz Kowalczyk", email: "tomasz@example.com" },
  { id: "6", display_name: "Katarzyna Lewandowska", email: "katarzyna@example.com" },
  { id: "7", display_name: "Michał Zieliński", email: "michal@example.com" },
  { id: "8", display_name: "Agnieszka Szymańska", email: "agnieszka@example.com" },
]

export function getTotalPages(filters: {
  level?: string
  priceMin?: string
  priceMax?: string
  dateFrom?: string
  dateTo?: string
} = {}): number {
  // Simulate different total counts based on filters
  let baseCount = 127 // Total events without filters
  
  if (filters.level) {
    baseCount = Math.floor(baseCount * 0.4) // Each level has ~40% of total events
  }
  
  if (filters.priceMin || filters.priceMax) {
    baseCount = Math.floor(baseCount * 0.6) // Price filters reduce results
  }
  
  if (filters.dateFrom || filters.dateTo) {
    baseCount = Math.floor(baseCount * 0.3) // Date filters significantly reduce results
  }
  
  const eventsPerPage = 10
  return Math.max(1, Math.ceil(baseCount / eventsPerPage))
}

export function generateMockEvents(filters: {
  level?: string
  priceMin?: string
  priceMax?: string
  dateFrom?: string
  dateTo?: string
  page?: string
} = {}): EventWithCreator[] {
  const page = parseInt(filters.page || "1")
  const eventsPerPage = 10
  const totalPages = getTotalPages(filters)
  
  // Return empty array if page is beyond total pages
  if (page > totalPages) return []
  
  const events: EventWithCreator[] = []
  const startIndex = (page - 1) * eventsPerPage
  
  for (let i = 0; i < eventsPerPage; i++) {
    const globalIndex = startIndex + i
    
    // Determine level based on filters or cycle through levels
    let level: "beginner" | "street" | "pro"
    if (filters.level) {
      level = filters.level as "beginner" | "street" | "pro"
    } else {
      level = ["beginner", "street", "pro"][globalIndex % 3] as "beginner" | "street" | "pro"
    }
    
    // Generate price within filter range or random
    let price: number
    const minPrice = filters.priceMin ? parseInt(filters.priceMin) : 30
    const maxPrice = filters.priceMax ? parseInt(filters.priceMax) : 300
    price = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice
    
    // Generate date within filter range or next 90 days
    let eventDate: Date
    const today = new Date()
    
    if (filters.dateFrom && filters.dateTo) {
      const fromDate = new Date(filters.dateFrom)
      const toDate = new Date(filters.dateTo)
      const timeDiff = toDate.getTime() - fromDate.getTime()
      eventDate = new Date(fromDate.getTime() + Math.random() * timeDiff)
    } else if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom)
      const maxDate = new Date(fromDate)
      maxDate.setDate(maxDate.getDate() + 90)
      const timeDiff = maxDate.getTime() - fromDate.getTime()
      eventDate = new Date(fromDate.getTime() + Math.random() * timeDiff)
    } else if (filters.dateTo) {
      const toDate = new Date(filters.dateTo)
      const minDate = new Date()
      const timeDiff = toDate.getTime() - minDate.getTime()
      eventDate = new Date(minDate.getTime() + Math.random() * timeDiff)
    } else {
      eventDate = new Date()
      eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 90) + 1)
    }
    
    const location = mockLocations[globalIndex % mockLocations.length]
    const creator = mockCreators[globalIndex % mockCreators.length]
    const title = mockEventTitles[globalIndex % mockEventTitles.length]
    const description = mockDescriptions[globalIndex % mockDescriptions.length]
    
    events.push({
      id: `event-${globalIndex}`,
      title,
      description,
      event_date: eventDate.toISOString(),
      level,
      price,
      status: "approved",
      created_by: creator.id,
      location_id: location.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator,
      location,
    })
  }
  
  return events
}
