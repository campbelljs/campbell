const path = require("path");
const { workerData, parentPort } = require("worker_threads");

const Campbell = require(path.resolve(__dirname, "../../../../"));
const { rootDir, taskName, propsData, taskId, debug } = workerData;

const instance = Campbell.createWorkerFromDir(rootDir, debug);
const { logger } = instance;

let $running = false;
let $task;

parentPort.once("message", message => {
  switch (message) {
    case "abort":
      process.exit();
      break;
    case "run":
      if ($task) $task._run(propsData);
      $running = true;
      break;
    default:
      logger.error(`unknown parent message ${message}`);
  }
});

instance.init().then(() => {
  let task = instance.tasks.getTask(taskName);
  task.id = taskId;
  task.onAny(function(event, payload) {
    parentPort.postMessage({ event, payload });
  });
  $task = task;
  if ($running) task._run(propsData);
});
