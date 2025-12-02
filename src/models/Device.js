import { Schema, model } from 'mongoose';

const deviceSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['light', 'thermostat', 'security', 'media', 'other'],
      default: 'other',
    },
    category: {
      type: String,
      required: [true, 'Device category is required'],
      trim: true,
    },
    // Using Mixed type to allow flexible status properties
    status: {
      type: Schema.Types.Mixed,
      default: { isOn: false },
    },
  },
  {
    timestamps: true,
  }
);

const Device = model('Device', deviceSchema);
export default Device;