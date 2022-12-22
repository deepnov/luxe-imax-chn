import cron from 'node-cron';

cron.schedule(`*/180 * * * *`, async () => {
  console.log(`running your task...`);
  
  console.log(`finished running your task...`);
});
