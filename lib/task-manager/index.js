const { Worker } = require("worker_threads");

class Process {
  constructor({ id, taskName }) {
    this.taskName = taskName;
  }
  run(props) {
    let workerData = {
      taskName,
      props
    };
    let worker = new Worker(require.resolve("./run"), {
      workerData,
      stdout: true,
      stderr: true
    });
  }
}

class TaskManager {
  #app;
  constructor(app) {
    this.#app = app;
  }
  run(taskName, params) {}
  static create(app) {
    return new TaskManager(app);
  }
}
