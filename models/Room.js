import { Schema, model } from 'mongoose';

const roomSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
    },
    house: {
      type: Schema.Types.ObjectId,
      ref: 'House',
      required: true,
    },
    devices: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Device',
      },
    ],
    settings: {
      temperature: {
        type: Number,
        default: 21,
      },
      lighting: {
        type: Number, // Brightness percentage
        default: 100,
        min: 0,
        max: 100,
      },
    },
  },
  {
    timestamps: true,
  }
);

const Room = model('Room', roomSchema);
export default Room;