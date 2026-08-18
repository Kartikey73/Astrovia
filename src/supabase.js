// src/supabase.js
// Supabase client using environment variables - never hardcode credentials

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2@/supabase.min.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Using fallback data.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoSignIn: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Public read functions (no auth required for basic data)
export async function getPlanets() {
  const { data, error } = await supabase
    .from('planets')
    .select('*')
    .order('name', { ascending: true });
  if (error) {
    console.error('Supabase getPlanets error:', error);
    return getFallbackPlanets();
  }
  return data || getFallbackPlanets();
}

export async function getPlanetByName(name) {
  const { data, error } = await supabase
    .from('planets')
    .select('*')
    .eq('name', name)
    .single();
  if (error) {
    console.error(`Supabase getPlanetByName error for ${name}:`, error.message);
    return getFallbackPlanet(name);
  }
  return data;
}

export async function upsertPlanet(planetData) {
  const { data, error } = await supabase
    .from('planets')
    .upsert({ ...planetData, updated_at: new Date().toISOString() }, { onConflict: 'name' });
  if (error) throw error;
  return data;
}

// =====================================================
// Mission data functions
// =====================================================

export async function getMissions() {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('name', { ascending: true });
  if (error) {
    console.error('Supabase getMissions error:', error);
    return getFallbackMissions();
  }
  return data || getFallbackMissions();
}

// =====================================================
// Celestial events functions
// =====================================================

export async function getCelestialEvents() {
  const { data, error } = await supabase
    .from('celestial_events')
    .select('*')
    .order('event_date', { ascending: true });
  if (error) {
    console.error('Supabase getCelestialEvents error:', error);
    return getFallbackEvents();
  }
  return data || getFallbackEvents();
}

// n8n-compatible: upsert celestial event
export async function upsertCelestialEvent(eventData) {
  const { data, error } = await supabase
    .from('celestial_events')
    .upsert({ ...eventData, updated_at: new Date().toISOString() }, { onConflict: 'title' });
  if (error) throw error;
  return data;
}

// =====================================================
// Fallback data - used when Supabase is unavailable
// =====================================================

function getFallbackPlanets() {
  return [
    {
      id: 'earth',
      name: 'Earth',
      type: 'terrestrial planet',
      description: 'Third planet from the Sun and the only astronomical object known to harbor life.',
      diameter_km: 12742,
      mass_kg: 5.972e24,
      gravity_m_s2: 9.807,
      distance_from_sun_km: 149.6e6,
      orbital_period_days: 365.25,
      rotation_period_hours: 23.93,
      temperature_celsius: 15,
      atmosphere: 'Nitrogen, Oxygen',
      image_url: '/assets/textures/earth.jpg',
      texture_url: '/assets/textures/earth.jpg'
    },
    {
      id: 'mars',
      name: 'Mars',
      type: 'terrestrial planet',
      description: 'Fourth planet from the Sun, known as the Red Planet due to iron oxide on its surface.',
      diameter_km: 6779,
      mass_kg: 6.417e23,
      gravity_m_s2: 3.71,
      distance_from_sun_km: 227.9e6,
      orbital_period_days: 687,
      rotation_period_hours: 24.62,
      temperature_celsius: -65,
      atmosphere: 'Carbon dioxide',
      image_url: '/assets/textures/mars.jpg',
      texture_url: '/assets/textures/mars.jpg'
    },
    {
      id: 'jupiter',
      name: 'Jupiter',
      type: 'gas giant',
      description: 'Fifth planet from the Sun and the largest planet in the Solar System, a gas giant with a strong magnetic field.',
      diameter_km: 139820,
      mass_kg: 1.898e27,
      gravity_m_s2: 24.79,
      distance_from_sun_km: 778.5e6,
      orbital_period_days: 4333,
      rotation_period_hours: 9.9,
      temperature_celsius: -145,
      atmosphere: 'Hydrogen, Helium',
      image_url: '/assets/textures/jupiter.jpg',
      texture_url: '/assets/textures/jupiter.jpg'
    },
    {
      id: 'saturn',
      name: 'Saturn',
      type: 'gas giant',
      description: 'Sixth planet from the Sun, famous for its extensive ring system composed of ice and rock particles.',
      diameter_km: 116460,
      mass_kg: 5.683e26,
      gravity_m_s2: 10.44,
      distance_from_sun_km: 1.434e9,
      orbital_period_days: 10759,
      rotation_period_hours: 10.7,
      temperature_celsius: -178,
      atmosphere: 'Hydrogen, Helium',
      image_url: '/assets/textures/saturn.jpg',
      texture_url: '/assets/textures/saturn.jpg'
    }
  ];
}

function getFallbackPlanet(name) {
  const planets = getFallbackPlanets();
  return planets.find(p => p.name.toLowerCase() === name.toLowerCase()) || planets[0];
}

function getFallbackMissions() {
  return [
    { id: 'apollo11', name: 'Apollo 11', agency: 'NASA', target: 'Moon', launch_date: '1969-07-16', status: 'completed', description: 'First manned mission to land on the Moon.' },
    { id: 'voyager1', name: 'Voyager 1', agency: 'NASA', target: 'Interstellar space', launch_date: '1977-09-05', status: 'active', description: 'First spacecraft to reach interstellar space.' },
    { id: 'mars-rover', name: 'Perseverance', agency: 'NASA', target: 'Mars', launch_date: '2020-07-30', status: 'active', description: 'Mars rover searching for signs of ancient life.' }
  ];
}

function getFallbackEvents() {
  return [
    { id: 'eclipse2024', event_type: 'solar eclipse', title: 'Total Solar Eclipse', description: 'A total solar eclipse will be visible from parts of North America.', event_date: new Date(), visibility: 'North America' }
  ];
}