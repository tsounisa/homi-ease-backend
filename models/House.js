import { Schema, model } from 'mongoose';

const houseSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'House name is required'],
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rooms: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Room',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const House = model('House', houseSchema);
export default House;