const express = require('express');
const router = express.Router();

// Simple categories list (can be extended or moved to DB)
const categories = [
  { id: 'Electricity', title: 'Electricity', description: 'Report power outages or wiring issues' },
  { id: 'Water', title: 'Water', description: 'Report water supply or leakage problems' },
  { id: 'Sanitation', title: 'Sanitation', description: 'Report sanitation and public hygiene issues' },
  { id: 'Road Damage', title: 'Road Damage', description: 'Report potholes or damaged roads' },
  { id: 'Street Light', title: 'Street Light', description: 'Report broken or flickering street lights' },
  { id: 'Public Safety', title: 'Public Safety', description: 'Report hazards affecting public safety' },
  { id: 'Drainage', title: 'Drainage', description: 'Report blocked or overflowing drains' },
  { id: 'Others', title: 'Others', description: 'Report other civic issues not listed above' },
];

router.get('/', (req, res) => {
  res.json(categories);
});

module.exports = router;
