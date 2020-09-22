const path = require("path");
const { Worker } = require("worker_threads");
const WritableStream = require("stream").Writable;
const { EventEmitter2 } = require("eventemitter2");
const Alton = require("alton");

class Job extends EventEmitter2 {
  constructor(instance, options) {
    super({ wildcard: true });
    this.instance = instance;
    this.$options = options;

    let { name, run, props, debug } = options;
    if (!name) throw new Error("jobs must have a name");
    this.name = name;

    if (typeof run !== "function")
      throw new Error(
        `jobs ${name} must have the property "run" and it must be a function`
      );
    this.debug = debug || false;
    this.nbSpawned = 0;

    this.$propsSchema = new Alton(props || {});
  }
  run(props = {}) {
    this.props = this.$propsSchema.load(props);
    this.$options.run.call(this, this.props);
  }
}

class Task extends EventEmitter2 {
  #instance;
  constructor(instance, job, propsData = {}, debug = false) {
    super({ wildcard: true });
    this.#instance = instance;
    this.propsData = propsData;
    this.debug = debug || job.debug;
    this.job = job;

    job.nbSpawned += 1;
    this.id = `${job.name}-${job.nbSpawned}`;

    this.createWorker();

    this.startDate = null;
    this.endDate = null;

    this.status = "waiting";
    instance.tasks.active[this.id] = this;
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
      job: { name: jobName },
      id: taskId,
      propsData,
      debug
    } = this;
    this.worker = new Worker(path.resolve(__dirname, "run.js"), {
      stdout: true,
      stderr: true,
      workerData: {
        rootDir: instance.getDir("root"),
        jobName,
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
    delete this.#instance.tasks.active[this.id];
  }
}

class TaskManager {
  #instance;
  constructor(instance) {
    this.#instance = instance;

    this.jobs = {};
    this.active = {};
  }
  register(options) {
    let job = new Job(this.#instance, options);
    this.jobs[job.name] = job;
  }
  getJob(name) {
    let job = this.jobs[name];
    if (!job) throw new Error(`unknown job ${name}`);
    else return job;
  }
  init(jobName, propsData, debug = false) {
    const job = this.getJob(jobName);
    let task = new Task(this.#instance, job, propsData, debug);
    return task;
  }
  run(jobName, propsData, debug) {
    let task = this.init(jobName, propsData, debug);
    task.run();
    return task;
  }
  static create(instance) {
    return new TaskManager(instance);
  }
}

module.exports = TaskManager;
