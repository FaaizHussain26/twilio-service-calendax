const mongoose = require('mongoose');

const ScreeningResponseSchema = new mongoose.Schema({
  participantId: {
    type: String,
    required: true,
    unique: true
  },
  site: {
    type: String,
    required: true
  },
  dateSubmitted: {
    type: Date,
    default: Date.now
  },
  inclusionCriteria: [
    {
      questionNumber: Number,
      questionText: String,
      response: {
        type: String,
        required: true
      }
    }
  ],
  exclusionCriteria: [
    {
      questionNumber: Number,
      questionText: String,
      response: {
        type: String,
        required: true
      }
    }
  ],
  isEligible: {
    type: Boolean,
    default: null 
  },
  notes: String
});

module.exports = mongoose.model('screening-response', ScreeningResponseSchema);
