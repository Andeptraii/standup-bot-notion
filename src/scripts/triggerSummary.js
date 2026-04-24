require('dotenv').config();
const { aggregateStandups } = require('../services/summary');

aggregateStandups()
  .then((result) => {
    console.log('Kết quả trigger summary:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Lỗi:', err.message);
    process.exit(1);
  });
