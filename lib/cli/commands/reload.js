module.exports = {
  command: "reload",
  desc: "Reload things",
  handler: ({ $ }) => {
    $.reload();
  }
};
