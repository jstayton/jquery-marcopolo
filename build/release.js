module.exports = function (callback) {
  var exec = require('child_process').exec,
      fs = require('fs'),
      path = require('path');

  var pushTag = function (version) {
    process.stdout.write('Pushing release... ');

    exec('git push --tags origin master', function (error, stdout, stderr) {
      if (!error) {
        process.stdout.write("Done!\n");

        callback && callback();
      }
      else {
        process.stdout.write("Failed!\n");
        process.stdout.write(stdout);
      }
    });
  };

  var tag = function (version) {
    process.stdout.write('Tagging release... ');

    exec('git tag -a v' + version + ' -m "Version ' + version + '."', function (error, stdout, stderr) {
      if (!error) {
        process.stdout.write("Done!\n");

        pushTag(version);
      }
      else {
        process.stdout.write("Failed!\n");
        process.stdout.write(stdout);
      }
    });
  };

  var pushCommit = function (version) {
    process.stdout.write('Pushing changes... ');

    exec('git push origin master', function (error, stdout, stderr) {
      if (!error) {
        process.stdout.write("Done!\n");

        tag(version);
      }
      else {
        process.stdout.write("Failed!\n");
        process.stdout.write(stdout);
      }
    });
  };

  var commit = function (version) {
    process.stdout.write('Committing changes... ');

    exec('git commit -a -m "Version ' + version + '."', function (error, stdout, stderr) {
      if (/\d+ files changed/i.test(stdout)) {
        process.stdout.write("Done!\n");

        pushCommit(version);
      }
      else {
        process.stdout.write("Failed!\n");
        process.stdout.write(stdout);
      }
    });
  };

  var replaceVersion = function (version) {
    var minifiedPath = path.normalize(__dirname + '/../jquery.marcopolo.min.js'),
        minifiedSrc = fs.readFileSync(minifiedPath, 'utf8');

    process.stdout.write('Replacing version number... ');

    minifiedSrc = minifiedSrc.replace('@VERSION', version);

    fs.writeFileSync(minifiedPath, version);

    fs.writeFileSync(__dirname + '/version.txt', version);

    process.stdout.write("Done!\n");

    commit(version);
  };

  var promptForVersion = function () {
    var lastVersion = fs.readFileSync(__dirname + '/version.txt', 'utf8').trim();

    process.stdout.write('Enter a version number (last was ' + lastVersion + '): ');

    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.once('data', function (version) {
      process.stdin.pause();

      version = version.trim();

      if (/^\d+\.\d+\.\d+$/.test(version)) {
        replaceVersion(version);
      }
      else {
        process.stdout.write("Invalid version number! It must be in the form of #.#.#.\n");

        promptForVersion();
      }
    });
  };

  var pullAndStatus = function () {
    process.stdout.write('Checking for outstanding changes... ');

    exec('git pull origin master && git status', function (error, stdout, stderr) {
      if (/nothing to commit \(working directory clean\)/i.test(stdout)) {
        process.stdout.write("All clean!\n");

        promptForVersion();
      }
      else {
        process.stdout.write("Outstanding changes! You must commit before continuing.\n");
      }
    });
  };

  pullAndStatus();
};
