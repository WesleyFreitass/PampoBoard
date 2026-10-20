import mongoose from 'mongoose';

const connectionSchema = new mongoose.Schema(
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
    connId: {
      type: String,
      required: true,
    },
    fromCardId: {
      type: String,
      required: true,
    },
    fromPort: {
      type: String,
      enum: ['top', 'right', 'bottom', 'left'],
      required: true,
    },
    toCardId: {
      type: String,
      required: true,
    },
    toPort: {
      type: String,
      enum: ['top', 'right', 'bottom', 'left'],
      required: true,
    },
    label: {
      type: String,
      default: '',
    },
    style: {
      type: String,
      enum: ['solid', 'dashed', 'pulse'],
      default: 'solid',
    },
    color: {
      type: String,
      default: '#a855f7',
    },
  },
  {
    timestamps: true,
  }
);

connectionSchema.index({ userId: 1, workspaceId: 1, parentBoardId: 1 });

export const Connection = mongoose.model('Connection', connectionSchema);
