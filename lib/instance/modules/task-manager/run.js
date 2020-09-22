const path = require("path");
const { workerData, parentPort } = require("worker_threads");

const Campbell = require(path.resolve(__dirname, "../../../../"));
const { rootDir, jobName, propsData, taskId, debug } = workerData;

const instance = Campbell.createWorkerFromDir(rootDir, debug);
const { logger } = instance;

let $running = false;
let $job;

parentPort.once("message", message => {
  switch (message) {
    case "abort":
      process.exit();
      break;
    case "run":
      if ($job) $job.run(propsData);
      $running = true;
      break;
    default:
      logger.error(`unknown parent message ${message}`);
  }
});

instance.init().then(() => {
  let job = instance.tasks.getJob(jobName);
  job.id = taskId;
  job.onAny(function(event, payload) {
    parentPort.postMessage({ event, payload });
  });
  $job = job;
  if ($running) job.run(propsData);
});
