// src/ai.js
// AI Space Assistant service layer
// Connects the AI assistant to Supabase and public API data

// =====================================================
// Get AI context based on selected planet
// =====================================================

export function getAIContext(selectedPlanet, dynamicPlanetData = null, missionData = null, eventData = null) {
  const context = {
    selectedPlanet: selectedPlanet || 'none',
    planetInfo: {},
    missionInfo: missionData || [],
    eventInfo: eventData || [],
    availableData: ''
  };
  
  // Get planet data from dynamicPlanetData (Supabase) or fallback
  const getPlanetInfo = (planetName) => {
    if (!planetName) return context.planetInfo;
    
    // Try dynamic data first (from Supabase)
    if (dynamicPlanetData && dynamicPlanetData.length > 0) {
      const planet = dynamicPlanetData.find(p => p.name.toLowerCase() === planetName.toLowerCase());
      if (planet) {
        context.planetInfo = {
          name: planet.name,
          type: planet.type,
          description: planet.description,
          diameter: planet.diameter_km,
          gravity: planet.gravity_m_s2,
          temperature: planet.temperature_celsius,
          atmosphere: planet.atmosphere,
          distance_from_sun: planet.distance_from_sun_km,
          orbital_period: planet.orbital_period_days,
          rotation_period: planet.rotation_period_hours
        };
        return context.planetInfo;
      }
    }
    
    // Fallback to existing static data (planetEducationalDossiers)
    // Known planet data for Earth, Mars, Jupiter, Saturn
    const fallbackPlanets = {
      earth: { name: 'Earth', type: 'terrestrial planet', description: 'Third planet from the Sun and the only astronomical object known to harbor life.', diameter_km: 12742 },
      mars: { name: 'Mars', type: 'terrestrial planet', description: 'Fourth planet from the Sun, known as the Red Planet due to iron oxide on its surface.', diameter_km: 6779 },
      jupiter: { name: 'Jupiter', type: 'gas giant', description: 'Fifth planet from the Sun and the largest planet in the Solar System, a gas giant with a strong magnetic field.', diameter_km: 139820 },
      saturn: { name: 'Saturn', type: 'gas giant', description: 'Sixth planet from the Sun, famous for its extensive ring system composed of ice and rock particles.', diameter_km: 116460 }
    };
    
    const planet = fallbackPlanets[planetName.toLowerCase()];
    if (planet) {
      context.planetInfo = { ...planet };
    }
    return context.planetInfo;
  };
  
  getPlanetInfo(selectedPlanet);
  
  // Format mission info
  context.missionInfo = Array.isArray(missionData) ? missionData : [];
  
  // Format event info
  context.eventInfo = Array.isArray(eventData) ? eventData : [];
  
  // Format context string for AI prompt
  context.availableData = `
Selected Planet: ${context.planetInfo.name || 'None'}
Planet Type: ${context.planetInfo.type || 'Unknown'}
Planet Description: ${context.planetInfo.description || 'No description available'}
Planet Diameter: ${context.planetInfo.diameter_km || 'Unknown'} km
Planet Gravity: ${context.planetInfo.gravity_m_s2 || 'Unknown'} m/s²
Planet Temperature: ${context.planetInfo.temperature_celsius || 'Unknown'}°C
Planet Atmosphere: ${context.planetInfo.atmosphere || 'Unknown'}
Planet Distance from Sun: ${context.planetInfo.distance_from_sun_km || 'Unknown'} km
Planet Orbital Period: ${context.planetInfo.orbital_period_days || 'Unknown'} days
Planet Rotation Period: ${context.planetInfo.rotation_period_hours || 'Unknown'} hours

Missions: ${context.missionInfo.length > 0 ? context.missionInfo.map(m => `- ${m.name} (${m.agency}) targeting ${m.target}`).join('\n') : 'No mission data available'}

Celestial Events: ${context.eventInfo.length > 0 ? context.eventInfo.map(e => `- ${e.title}: ${e.description}`).join('\n') : 'No event data available'}
`;
  
  return context;
}

// =====================================================
// Generate AI prompt
// =====================================================

export function getAIPrompt(userQuestion, selectedPlanet, dynamicPlanetData = null, missionData = null, eventData = null) {
  // Get context
  const context = getAIContext(selectedPlanet, dynamicPlanetData, missionData, eventData);
  
  // Build AI prompt
  const prompt = `
You are an AI assistant for ASTRAVIA, a 3D interactive space exploration website. The user is asking about space/astronomy topics.

CONTEXT:
${context.availableData}

USER QUESTION: ${userQuestion}

INSTRUCTIONS:
- Use the context data above to provide accurate information
- If the answer requires current data (like today's APOD), check if we have cached data
- Clearly distinguish between:
  - Known scientific information (always accurate)
  - Current API data (may be time-sensitive)
  - Estimated/calculated information
- If you don't have enough information from the context, say so honestly
- Do not hallucinate current space information
- Keep answers concise and educational

RESPONSE:
`;
  
  return {
    success: true,
    prompt: prompt,
    context: context
  };
}

// =====================================================
// Handle user questions
// =====================================================

export async function handleUserQuestion(userQuestion, selectedPlanet, dynamicPlanetData = null, missionData = null, eventData = null) {
  // Get AI prompt
  const result = getAIPrompt(userQuestion, selectedPlanet, dynamicPlanetData, missionData, eventData);
  
  // In a real implementation, would call AI model here
  // const aiResponse = await callAIModel(result.prompt);
  
  // For demonstration, return structured result
  return {
    success: true,
    question: userQuestion,
    planet: selectedPlanet,
    context: result.context,
    // response: aiResponse // Would be the actual AI answer
  };
}

// =====================================================
// Example: Handle specific question types
// =====================================================

export function getPlanetInfo(selectedPlanet, dynamicPlanetData) {
  const context = getAIContext(selectedPlanet, dynamicPlanetData);
  return context.planetInfo;
}

export function getMissionsInfo(missionData) {
  return missionData || [];
}

export function getEventsInfo(eventData) {
  return eventData || [];
}