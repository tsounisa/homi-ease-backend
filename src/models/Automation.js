import { Schema, model } from 'mongoose';

const automationSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Automation name is required'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    trigger: {
      type: {
        type: String,
        required: true,
        enum: ['Time', 'Sensor', 'Manual'],
      },
      value: {
        type: String, // e.g., "7:00 PM", "sensor-id-1 > 25"
        required: true,
      },
    },
    action: {
      deviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Device',
        required: true,
      },
      command: {
        type: Schema.Types.Mixed, // e.g., { isOn: true, brightness: 80 }
        required: true,
      },
    },
    isEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Automation = model('Automation', automationSchema);
export default Automation;