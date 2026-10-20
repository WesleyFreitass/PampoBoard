import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema(
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
    cardId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['note', 'live', 'media', 'link', 'table', 'column', 'board'],
      required: true,
    },
    title: {
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
      default: 320,
    },
    height: {
      type: Number,
      default: 300,
    },
    color: {
      type: String,
      default: 'default',
    },
    zIndex: {
      type: Number,
      default: 10,
    },
    status: {
      type: String,
      enum: ['backlog', 'in_progress', 'done', 'archived'],
      default: 'backlog',
    },
    zoneId: {
      type: String,
      default: null,
    },
    noteData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    liveData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    mediaData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    linkData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    tableData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    columnData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    boardData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries by user, workspace and board
cardSchema.index({ userId: 1, workspaceId: 1, parentBoardId: 1 });

export const Card = mongoose.model('Card', cardSchema);
