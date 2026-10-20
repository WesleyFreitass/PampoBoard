import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    workspaceId: {
      type: String,
      required: true,
      index: true,
    },
    parentBoardId: {
      type: String,
      default: 'root',
      index: true,
    },
    zoneId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: 'Nova Zona Delimitadora',
    },
    description: {
      type: String,
      default: '',
    },
    x: {
      type: Number,
      default: 0,
    },
    y: {
      type: Number,
      default: 0,
    },
    width: {
      type: Number,
      default: 600,
    },
    height: {
      type: Number,
      default: 400,
    },
    color: {
      type: String,
      default: '#8b5cf6',
    },
  },
  {
    timestamps: true,
  }
);

zoneSchema.index({ userId: 1, workspaceId: 1, parentBoardId: 1 });

export const Zone = mongoose.model('Zone', zoneSchema);
