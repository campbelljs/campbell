const path = require("path");
const { Worker } = require("worker_threads");
const WritableStream = require("stream").Writable;
const { EventEmitter2 } = require("eventemitter2");
const Alton = require("alton");

class Task extends EventEmitter2 {
  constructor(instance, options) {
    super({ wildcard: true });
    this.instance = instance;
    this.$options = options;

    let { name, run, props, debug } = options;
    if (!name) throw new Error("tasks must have a name");
    this.name = name;

    if (typeof run !== "function")
      throw new Error(
        `task ${name} must have the property "run" and it must be a function`
      );
    this.run = run;
    this.debug = debug || false;

    this.$propsSchema = new Alton(props || {});

    Object.assign(this, options);

    delete this[props];
  }
  _run(props = {}) {
    this.props = this.$propsSchema.load(props);
    this.run(this.props);
  }
}

class TaskInstance extends EventEmitter2 {
  #instance;
  constructor(instance, task, propsData = {}, debug = false) {
    super({ wildcard: true });
    this.#instance = instance;
    this.task = task;
    this.propsData = propsData;
    this.debug = debug || task.debug;

    task.runned += 1;
    this.id = `${task.name}-${task.runned}`;

    this.createWorker();

    this.startDate = null;
    this.endDate = null;

    this.status = "waiting";
    instance.tasks.running[this.id] = this;
  }
  get done() {
    return new Promise((resolve, reject) => {
      this.worker.on("exit", code => {
        if (code === 0) resolve();
        else reject(new Error(`task exited with code non zero code : ${code}`));
      });
    });
  }
  get duration() {
    let { startDate, endDate } = this;
    if (typeof endDate !== "number" || typeof startDate !== "number") {
      this.#instance.logger.error(
        `task [${this.id}] has not ended yet, can't get its duration`
      );
      return;
    } else return endDate - startDate;
  }
  createWorker() {
    let instance = this.#instance;
    let { logger } = instance;
    let {
      task: { name: taskName },
      id: taskId,
      propsData,
      debug
    } = this;
    this.worker = new Worker(path.resolve(__dirname, "run.js"), {
      stdout: true,
      stderr: true,
      workerData: {
        rootDir: instance.getDir("root"),
        taskName,
        taskId,
        propsData,
        debug
      }
    });
    this.worker.stdout.pipe(
      new WritableStream({
        write(chunk, encoding, callback) {
          logger.verbose(`[${taskId}] ${chunk.toString().trim()}`);
          callback();
        }
      })
    );
    this.worker.stderr.pipe(
      new WritableStream({
        write(chunk, encoding, callback) {
          logger.error(`[${taskId}] ${chunk.toString().trim()}`);
          callback();
        }
      })
    );
    this.worker.on("message", ({ event, payload }) => {
      this.emit(event, payload);
    });
    this.worker.on("error", err => {
      this.emit("error", err);
    });
    this.on("error", err => {
      logger.error(`[${taskId}] ` + err);
    });
    this.worker.on("exit", code => {
      this.exit(code);
    });
  }
  run() {
    this.startDate = Date.now();
    this.worker.postMessage("run");
    this.status = "running";
  }
  exit(code) {
    this.endDate = Date.now();
    this.status = code === 0 ? "failed" : "success";
    this.exitCode = code;
    delete this.#instance.tasks.running[this.id];
  }
}

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
  run(taskName, propsData, debug = false) {
    const task = this.get(taskName);

    let taskInstance = new TaskInstance(this.#instance, task, propsData, debug);

    taskInstance.run();

    return taskInstance;
  }
  static create(instance) {
    return new TaskManager(instance);
  }
}

module.exports = TaskManager;
