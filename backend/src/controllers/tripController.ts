import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Trip, { ITrip } from '../models/Trip';

// Exponential backoff executor for external API resilience
async function fetchWithRetry(url: string, options: RequestInit, retries = 5, delay = 1000): Promise<any> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        console.warn(`[Gemini API] 429 Rate Limited. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw new Error(`External API Error: Status Code ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      console.warn(`[Gemini API] Request failed. Retrying in ${delay}ms... Error:`, error);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

// Generate new Trip using Gemini API
export const generateNewTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  const { destination, durationDays, budgetTier, interests } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized. User context missing.' });
    return;
  }

  if (!destination || !durationDays || !budgetTier) {
    res.status(400).json({ message: 'Destination, durationDays, and budgetTier are required.' });
    return;
  }

  const interestString = interests && interests.length > 0 ? interests.join(', ') : 'general sightseeing';

  const prompt = `
    Create a highly detailed, professional, and exciting travel plan for a ${durationDays}-day trip to ${destination}.
    The budget profile is: ${budgetTier}.
    The traveler's interests include: ${interestString}.

    You MUST output ONLY a valid JSON object matching this schema exactly. Do not wrap it in markdown code blocks like \`\`\`json. Output raw JSON only.
    
    JSON Schema:
    {
      "itinerary": [
        {
          "dayNumber": 1,
          "activities": [
            {
              "title": "Activity Name",
              "description": "Engaging description of the activity and what to expect.",
              "estimatedCostUSD": 25,
              "timeOfDay": "Morning"
            }
          ]
        }
      ],
      "hotels": [
        {
          "name": "Hotel Name",
          "tier": "Budget | Mid-Range | Luxury",
          "estimatedCostNightUSD": 120,
          "rating": "4.5/5"
        }
      ],
      "estimatedBudget": {
        "transport": 150,
        "accommodation": 400,
        "food": 200,
        "activities": 150,
        "total": 900
      },
      "packingList": [
        {
          "item": "Waterproof Jacket",
          "category": "Clothing",
          "isPacked": false
        }
      ]
    }

    Guidelines:
    1. Activities: Provide 2 to 4 distinct activities per day. Ensure the "timeOfDay" value is exactly one of: "Morning", "Afternoon", or "Evening".
    2. Estimated Budget: Make sure estimates match typical realistic rates for the destination and budgetTier ("Low", "Medium", "High"). For low budget, select affordable hostels/hotels and cheaper transit. For high budget, select premium/luxury hotels and private tours.
    3. Weather Packing Checklist (Creative Feature): Analyze the destination's climate/typical weather for the current season. Suggest specialized items across categories: "Documents", "Clothing", "Gear", "Other". Include activity-specific items (e.g., hiking shoes if hiking is planned, swimsuit if beach/spa is mentioned).
    4. Hotels: Provide at least 3 hotel suggestions matching the budget profile.
  `;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ message: 'GEMINI_API_KEY is not defined in environment variables.' });
      return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const parsedResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedResponseText) {
      throw new Error('Failed to extract content from Gemini response.');
    }

    // Clean response text just in case Gemini wrapped it in backticks despite instructions
    let cleanJsonText = parsedResponseText.trim();
    if (cleanJsonText.startsWith('```')) {
      cleanJsonText = cleanJsonText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    const cleanResult = JSON.parse(cleanJsonText);

    // Save user isolated trip directly into MongoDB
    const newTrip = new Trip({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests: interests || [],
      itinerary: cleanResult.itinerary,
      hotels: cleanResult.hotels,
      estimatedBudget: cleanResult.estimatedBudget,
      packingList: cleanResult.packingList
    });

    const savedTrip = await newTrip.save();
    res.status(201).json(savedTrip);
  } catch (error) {
    console.error('Critical AI Generation Error:', error);
    res.status(500).json({ message: 'API encountered an error processing your trip request. Please try again.' });
  }
};

// Fetch user's saved trips (enforcing strict isolation)
export const fetchUserTrips = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized. User context missing.' });
    return;
  }

  try {
    const trips = await Trip.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json(trips);
  } catch (error) {
    console.error('Fetch Trips Error:', error);
    res.status(500).json({ message: 'Failed to retrieve saved trips.' });
  }
};

// Get a single trip by ID (with ownership check)
export const getTripById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized. User context missing.' });
    return;
  }

  try {
    const trip = await Trip.findById(id);
    if (!trip) {
      res.status(404).json({ message: 'Trip not found.' }); // 404
      return;
    }

    if (trip.userId.toString() !== userId) {
      res.status(403).json({ message: 'Access Denied. You do not own this trip.' });
      return;
    }

    res.status(200).json(trip);
  } catch (error) {
    console.error('Get Trip Error:', error);
    res.status(500).json({ message: 'Failed to fetch trip details.' });
  }
};

// Update trip elements (e.g. itinerary updates, checklist checkmarks)
export const updateTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;
  const updatePayload = req.body;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized. User context missing.' });
    return;
  }

  try {
    const trip = await Trip.findById(id);
    if (!trip) {
      res.status(404).json({ message: 'Trip not found.' });
      return;
    }

    if (trip.userId.toString() !== userId) {
      res.status(403).json({ message: 'Access Denied. You do not own this trip.' });
      return;
    }

    // Direct allowed update properties
    if (updatePayload.itinerary) {
      trip.itinerary = updatePayload.itinerary;
    }
    if (updatePayload.packingList) {
      trip.packingList = updatePayload.packingList;
    }
    if (updatePayload.estimatedBudget) {
      trip.estimatedBudget = updatePayload.estimatedBudget;
    }

    const updatedTrip = await trip.save();
    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error('Update Trip Error:', error);
    res.status(500).json({ message: 'Failed to update trip.' });
  }
};

// Delete a trip
export const deleteTrip = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized. User context missing.' });
    return;
  }

  try {
    const trip = await Trip.findById(id);
    if (!trip) {
      res.status(404).json({ message: 'Trip not found.' });
      return;
    }

    if (trip.userId.toString() !== userId) {
      res.status(403).json({ message: 'Access Denied. You do not own this trip.' });
      return;
    }

    await Trip.deleteOne({ _id: id });
    res.status(200).json({ message: 'Trip successfully deleted.' });
  } catch (error) {
    console.error('Delete Trip Error:', error);
    res.status(500).json({ message: 'Failed to delete trip.' });
  }
};

// Regenerate specific day of itinerary
export const regenerateDay = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { dayNumber, prompt: userInstructions } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    res.status(401).json({ message: 'Unauthorized. User context missing.' });
    return;
  }

  if (!dayNumber || !userInstructions) {
    res.status(400).json({ message: 'dayNumber and prompt are required parameters.' });
    return;
  }

  try {
    const trip = await Trip.findById(id);
    if (!trip) {
      res.status(404).json({ message: 'Trip not found.' });
      return;
    }

    if (trip.userId.toString() !== userId) {
      res.status(403).json({ message: 'Access Denied. You do not own this trip.' });
      return;
    }

    const systemPrompt = `
      You are an expert travel planner assistant.
      The user wants to regenerate Day ${dayNumber} of their trip to ${trip.destination}.
      General trip interests: ${trip.interests.join(', ')}.
      Budget profile: ${trip.budgetTier}.
      
      User's modification instruction for Day ${dayNumber}:
      "${userInstructions}"

      You MUST output ONLY a valid JSON array of activities for Day ${dayNumber} matching this schema. Do not wrap it in markdown code blocks like \`\`\`json. Output raw JSON only.

      JSON Schema:
      [
        {
          "title": "Activity Name",
          "description": "Engaging description of the activity.",
          "estimatedCostUSD": 30,
          "timeOfDay": "Morning"
        }
      ]

      Guidelines:
      1. Ensure there are 2 to 4 activities for this day.
      2. Ensure timeOfDay values are exactly: "Morning", "Afternoon", or "Evening".
      3. Align estimates with the trip's budget tier (${trip.budgetTier}).
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ message: 'GEMINI_API_KEY is not defined.' });
      return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: systemPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const parsedResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedResponseText) {
      throw new Error('Failed to extract content from Gemini response.');
    }

    let cleanJsonText = parsedResponseText.trim();
    if (cleanJsonText.startsWith('```')) {
      cleanJsonText = cleanJsonText.replace(/^```json\s*/, '').replace(/```$/, '').trim();
    }

    const newActivities = JSON.parse(cleanJsonText);

    // Find and update the day in our itinerary
    const dayIndex = trip.itinerary.findIndex((d) => d.dayNumber === Number(dayNumber));
    if (dayIndex !== -1) {
      trip.itinerary[dayIndex].activities = newActivities;
    } else {
      // If day does not exist for some reason, append it
      trip.itinerary.push({ dayNumber: Number(dayNumber), activities: newActivities });
    }

    // Sort itinerary by dayNumber just in case
    trip.itinerary.sort((a, b) => a.dayNumber - b.dayNumber);

    const savedTrip = await trip.save();
    res.status(200).json(savedTrip);
  } catch (error) {
    console.error('Regenerate Day Error:', error);
    res.status(500).json({ message: 'Failed to regenerate itinerary day. Please try again.' });
  }
};
