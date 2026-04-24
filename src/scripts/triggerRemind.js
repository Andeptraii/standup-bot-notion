require('dotenv').config();
const { checkAndRemind } = require('../services/reminder');

checkAndRemind()
  .then((result) => {
    console.log('Kết quả trigger remind:');
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Lỗi:', err.message);
    process.exit(1);
  });
