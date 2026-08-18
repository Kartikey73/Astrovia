// src/api.js
// Public space APIs service layer
// Handles NASA APIs with error handling, caching, and fallbacks

import { supabase } from './supabase.js';

const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || '';
const NASA_BASE = 'https://api.nasa.gov';

// =====================================================
// APOD - Astronomy Picture of the Day
// =====================================================

export async function getAPOD(date = null) {
  try {
    let url = `${NASA_BASE}/planetary/apod?api_key=${NASA_API_KEY}`;
    if (date) url += `&date=${date}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      cache: 'default'
    });
    
    if (!response.ok) throw new Error(`NASA APOD ${response.status}`);
    
    const data = await response.json();
    
    // Cache successful response in Supabase for n8n integration
    if (data.url && NASA_API_KEY) {
      try {
        await supabase.from('celestial_events').upsert({
          title: data.title,
          event_type: 'apod',
          description: data.explanation,
          event_date: new Date(data.date),
          source_url: data.url,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.debug('APOD cache write failed:', e.message);
      }
    }
    
    return { success: true, data: { title: data.title, explanation: data.explanation, url: data.url, hdurl: data.hdurl, media_type: data.media_type, date: data.date } };
  } catch (error) {
    console.error('APOD error:', error.message);
    return { success: false, error: error.message, cached: await getCachedAPODFromSupabase() };
  }
}

// =====================================================
// NEO - Near Earth Objects
// =====================================================

export async function getNEOFeed(startDate, endDate) {
  try {
    const url = `${NASA_BASE}/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${NASA_API_KEY}`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    
    if (!response.ok) throw new Error(`NASA NEO ${response.status}`);
    
    const data = await response.json();
    
    // Cache NEO data
    if (data.count > 0 && NASA_API_KEY) {
      try {
        await supabase.from('celestial_events').upsert({
          event_type: 'neo',
          title: `${data.count} Near Earth Objects`,
          description: `Near Earth Objects between ${startDate} and ${endDate}`,
          event_date: new Date(),
          source_url: null,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.debug('NEO cache write failed:', e.message);
      }
    }
    
    return { success: true, data: { near_earth_objects: data.near_earth_objects || [], count: data.count || 0, page: data.page || 1 } };
  } catch (error) {
    console.error('NEO feed error:', error.message);
    return { success: false, error: error.message, cached: await getCachedNEOsFromSupabase() };
  }
}

// =====================================================
// Mars Rover Photos
// =====================================================

export async function getMarsPhotos(rover = 'curiosity', sol = 1000) {
  try {
    const url = `${NASA_BASE}/mars-photos/api/v1/rovers/${rover}/photos?sol=${sol}&api_key=${NASA_API_KEY}`;
    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
    
    if (!response.ok) throw new Error(`NASA Mars Photos ${response.status}`);
    
    const data = await response.json();
    const photos = (data.photos || []).map(photo => ({
      id: photo.id, sol: photo.sol, camera: photo.camera.full_name, img_src: photo.img_src, earth_date: photo.earth_date
    }));
    
    return { success: true, data: { photos, total_photos: data.total_photos || 0, rover: data.rover ? data.rover.name : rover } };
  } catch (error) {
    console.error('Mars photos error:', error.message);
    return { success: false, error: error.message, cached: await getCachedMarsPhotosFromSupabase() };
  }
}

// =====================================================
// Cache retrieval from Supabase
// =====================================================

export async function getCachedAPODFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('celestial_events')
      .select('*')
      .eq('event_type', 'apod')
      .order('event_date', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data && data.length > 0 ? { success: true, data: data[0], cached: true } : { success: false, error: 'No cached APOD', cached: false };
  } catch (error) {
    console.error('Supabase APOD cache error:', error.message);
    return { success: false, error: error.message, cached: false };
  }
}

export async function getCachedNEOsFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('celestial_events')
      .select('*')
      .eq('event_type', 'neo')
      .order('event_date', { ascending: false })
      .limit(1);
    if (error) throw error;
    return data && data.length > 0 ? { success: true, data: data[0], cached: true } : { success: false, error: 'No cached NEOs', cached: false };
  } catch (error) {
    console.error('Supabase NEO cache error:', error.message);
    return { success: false, error: error.message, cached: false };
  }
}

export async function getCachedMarsPhotosFromSupabase() {
  try {
    const { data, error } = await supabase
      .from('celestial_events')
      .select('*')
      .eq('event_type', 'mars_photo')
      .order('event_date', { ascending: false })
      .limit(5);
    if (error) throw error;
    return data && data.length > 0 ? { success: true, data, cached: true } : { success: false, error: 'No cached Mars photos', cached: false };
  } catch (error) {
    console.error('Supabase Mars photos cache error:', error.message);
    return { success: false, error: error.message, cached: false };
  }
}