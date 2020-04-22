const path = require("path");
const { Worker } = require("worker_threads");
const WritableStream = require("stream").Writable;

const Task = require("./task");

class TaskManager {
  #instance;
  constructor(instance) {
    this.#instance = instance;

    this._tasks = {};
    this.running = {};
  }
  register(options) {
    let task = new Task(this.#instance, options);
    this._tasks[task.name] = {
      name: task.name,
      _task: task,
      runned: 0
    };
  }
  get(taskName) {
    if (!this._tasks[taskName]) throw new Error(`unknown task ${taskName}`);
    else return this._tasks[taskName];
  }
  getTask(taskName) {
    return this.get(taskName)._task;
  }
  run(taskName, propsData, onEvent, debug = false) {
    const task = this.get(taskName);
    task.runned += 1;
    const taskId = `${taskName}-${task.runned}`;
    const $this = this;
    const instance = this.#instance;
    const logger = instance.logger;

    const worker = new Worker(path.resolve(__dirname, "run.js"), {
      stdout: true,
      stderr: true,
      workerData: {
        rootDir: instance.getDir("root"),
        taskName,
        propsData,
        taskId,
        debug
      }
    });

    worker.stdout.pipe(
      new WritableStream({
        write(chunk, encoding, callback) {
          logger.verbose(`[${taskId}] ${chunk.toString().trim()}`);
          callback();
        }
      })
    );
    worker.stderr.pipe(
      new WritableStream({
        write(chunk, encoding, callback) {
          logger.error(`[${taskId}] ${chunk.toString().trim()}`);
          callback();
        }
      })
    );
    if (onEvent)
      worker.on("message", ({ event, payload }) => {
        onEvent(event, payload);
      });

    $this.running[taskId] = {
      id: taskId,
      worker,
      date_started: Date.now()
    };
    worker.on("exit", code => {
      delete $this.running[taskId];
    });

    let promise = new Promise(function(resolve, reject) {
      worker.on("exit", code => {
        if (code === 0) resolve();
        else reject(new Error(`task exited with code non zero code : ${code}`));
      });
    });

    worker.postMessage("run");

    return promise;
  }
  static create(instance) {
    return new TaskManager(instance);
  }
}

module.exports = TaskManager;
