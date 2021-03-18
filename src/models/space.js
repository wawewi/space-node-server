const mongoose = require('mongoose');

const spaceSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      }
    ],
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      }
    ],
    memories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      }
    ]
},
{
  timestamps: true,
}
)

const Space = mongoose.model('Space', spaceSchema);

module.exports = Space;