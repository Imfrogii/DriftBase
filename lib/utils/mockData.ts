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
]

const mockCreators = [
  { id: "1", display_name: "Alex Kowalski", email: "alex@example.com" },
  { id: "2", display_name: "Maria Nowak", email: "maria@example.com" },
  { id: "3", display_name: "Piotr Wiśniewski", email: "piotr@example.com" },
  { id: "4", display_name: "Anna Wójcik", email: "anna@example.com" },
  { id: "5", display_name: "Tomasz Kowalczyk", email: "tomasz@example.com" },
]

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
  
  // Generate fewer events for later pages to simulate finite data
  if (page > 5) return []
  
  const events: EventWithCreator[] = []
  const startIndex = (page - 1) * eventsPerPage
  
  for (let i = 0; i < eventsPerPage; i++) {
    const index = startIndex + i
    const level = filters.level || ["beginner", "street", "pro"][index % 3]
    
    // Apply level filter
    if (filters.level && level !== filters.level) continue
    
    const price = Math.floor(Math.random() * 200) + 50
    
    // Apply price filters
    if (filters.priceMin && price < parseInt(filters.priceMin)) continue
    if (filters.priceMax && price > parseInt(filters.priceMax)) continue
    
    // Generate date (next 60 days)
    const eventDate = new Date()
    eventDate.setDate(eventDate.getDate() + Math.floor(Math.random() * 60) + 1)
    
    // Apply date filters
    if (filters.dateFrom && eventDate < new Date(filters.dateFrom)) continue
    if (filters.dateTo && eventDate > new Date(filters.dateTo)) continue
    
    const location = mockLocations[index % mockLocations.length]
    const creator = mockCreators[index % mockCreators.length]
    
    events.push({
      id: `event-${page}-${i}`,
      title: mockEventTitles[index % mockEventTitles.length],
      description: mockDescriptions[index % mockDescriptions.length],
      event_date: eventDate.toISOString(),
      level: level as "beginner" | "street" | "pro",
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
