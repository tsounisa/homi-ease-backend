import { Schema, model } from 'mongoose';

const scenarioSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Scenario name is required'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // An array of multiple actions
    actions: [
      {
        deviceId: {
          type: Schema.Types.ObjectId,
          ref: 'Device',
          required: true,
        },
        command: {
          type: Schema.Types.Mixed,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Scenario = model('Scenario', scenarioSchema);
export default Scenario;