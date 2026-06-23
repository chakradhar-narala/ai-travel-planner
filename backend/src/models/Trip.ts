import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity {
  _id?: string;
  title: string;
  description?: string;
  estimatedCostUSD: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
}

export interface IItineraryDay {
  dayNumber: number;
  activities: IActivity[];
}

export interface IHotel {
  name: string;
  tier?: string;
  estimatedCostNightUSD?: number;
  rating?: string;
}

export interface IEstimatedBudget {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface IPackingItem {
  _id?: string;
  item: string;
  category: 'Documents' | 'Clothing' | 'Gear' | 'Other';
  isPacked: boolean;
}

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: IItineraryDay[];
  hotels: IHotel[];
  estimatedBudget: IEstimatedBudget;
  packingList: IPackingItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  estimatedCostUSD: { type: Number, default: 0 },
  timeOfDay: { type: String, enum: ['Morning', 'Afternoon', 'Evening'], required: true }
});

const ItineraryDaySchema = new Schema({
  dayNumber: { type: Number, required: true },
  activities: [ActivitySchema]
});

const HotelSchema = new Schema({
  name: { type: String, required: true },
  tier: { type: String },
  estimatedCostNightUSD: { type: Number },
  rating: { type: String }
});

const PackingItemSchema = new Schema({
  item: { type: String, required: true },
  category: { type: String, enum: ['Documents', 'Clothing', 'Gear', 'Other'], required: true },
  isPacked: { type: Boolean, default: false }
});

const TripSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    destination: { type: String, required: true },
    durationDays: { type: Number, required: true },
    budgetTier: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
    interests: [{ type: String }],
    itinerary: [ItineraryDaySchema],
    hotels: [HotelSchema],
    estimatedBudget: {
      transport: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    packingList: [PackingItemSchema]
  },
  { timestamps: true }
);

export default mongoose.model<ITrip>('Trip', TripSchema);
