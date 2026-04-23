const PitchEvent = require('../models/PitchEvent');
const PitchScore = require('../models/PitchScore');
const PitchVote = require('../models/PitchVote');
const PitchRegistration = require('../models/PitchRegistration');
const User = require('../models/User');
const Team = require('../models/Team');

exports.publishResults = async (req, res) => {
  try {
    const event = await PitchEvent.findById(req.params.eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.organizer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only the organizer can publish results' });
    }

    event.status = 'results_published';
    await event.save();

    // Calculate rankings and assign badges to top 3
    const scores = await PitchScore.aggregate([
      { $match: { event: event._id, isSubmitted: true } },
      { $group: { _id: '$team', avgTotal: { $avg: '$totalScore' } } },
      { $sort: { avgTotal: -1 } }
    ]);

    const badgeLabels = ['🏆 Pitch Champion', '🥈 Runner Up', '🥉 Third Place'];
    const now = new Date();
    const season = now.getMonth() < 6 ? 'Spring' : 'Fall';
    const year = now.getFullYear();

    for (let i = 0; i < Math.min(3, scores.length); i++) {
      const teamId = scores[i]._id;
      const team = await Team.findById(teamId);
      if (!team) continue;

      const badgeTitle = `${badgeLabels[i]} - ${event.title} ${season} ${year}`;

      for (const member of team.members) {
        await User.findByIdAndUpdate(member.userId, {
          $push: { badges: { title: badgeTitle, eventId: event._id, awardedAt: now } }
        });
      }
    }

    res.json({ message: 'Results published and badges awarded', event });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error publishing results' });
  }
};

exports.getResults = async (req, res) => {
  try {
    const event = await PitchEvent.findById(req.params.eventId)
      .populate('organizer', 'name')
      .populate('judges', 'name');
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.status !== 'results_published') {
      return res.status(403).json({ message: 'Results not yet published' });
    }

    const scores = await PitchScore.aggregate([
      { $match: { event: event._id, isSubmitted: true } },
      {
        $group: {
          _id: '$team',
          avgTotal: { $avg: '$totalScore' },
          avgProblem: { $avg: '$problemClarity' },
          avgSolution: { $avg: '$solutionViability' },
          avgTeam: { $avg: '$teamStrength' },
          avgMarket: { $avg: '$marketPotential' },
          judgeCount: { $sum: 1 }
        }
      },
      { $sort: { avgTotal: -1 } }
    ]);

    const populatedScores = await Team.populate(scores, { path: '_id', select: 'name logoUrl problemStatement' });
    const rankings = populatedScores.map((s, i) => ({
      rank: i + 1,
      team: s._id,
      avgTotal: Math.round(s.avgTotal * 10) / 10,
      avgProblem: Math.round(s.avgProblem * 10) / 10,
      avgSolution: Math.round(s.avgSolution * 10) / 10,
      avgTeam: Math.round(s.avgTeam * 10) / 10,
      avgMarket: Math.round(s.avgMarket * 10) / 10,
      judgeCount: s.judgeCount
    }));

    const votes = await PitchVote.aggregate([
      { $match: { event: event._id } },
      { $group: { _id: '$team', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    const populatedVotes = await Team.populate(votes, { path: '_id', select: 'name' });

    const feedbacks = await PitchScore.find({ event: event._id, isSubmitted: true, feedback: { $ne: '' } })
      .populate('team', 'name')
      .populate('judge', 'name')
      .select('team judge feedback totalScore');

    res.json({
      event,
      rankings,
      audienceVotes: populatedVotes.map(v => ({ team: v._id, count: v.count })),
      feedbacks
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error fetching results' });
  }
};

exports.getEventStats = async (req, res) => {
  try {
    const PitchRoom = require('../models/PitchRoom');
    const room = await PitchRoom.findOne({ event: req.params.eventId });
    const voteCount = await PitchVote.countDocuments({ event: req.params.eventId });
    const regCount = await PitchRegistration.countDocuments({ event: req.params.eventId, status: 'approved' });

    res.json({
      viewerCount: room?.viewerCount || 0,
      totalVotes: voteCount,
      registeredTeams: regCount
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};
