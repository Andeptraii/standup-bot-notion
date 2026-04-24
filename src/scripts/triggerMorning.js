require('dotenv').config();
const { generateDailyPages } = require('../services/dailyStandup');

generateDailyPages()
  .then((results) => {
    console.log('Kết quả trigger morning:');
    console.log(JSON.stringify(results, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Lỗi:', err.message);
    process.exit(1);
  });
